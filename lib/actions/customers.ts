"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOperator } from "@/lib/auth";
import { requireCustomerUser } from "@/lib/customer-auth";
import { generateInvitationToken } from "@/lib/actions/customer-auth";
import { prisma } from "@/lib/prisma";

export type CustomerManagementState = {
  error: string | null;
  activationPath: string | null;
};

export type CustomerOperationResult =
  | { ok: true }
  | { ok: false; error: string };

function activationUrl(token: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  return origin ? `${origin}/activate/${token}` : `/activate/${token}`;
}

const workspaceSchema = z.object({
  accountName: z.string().trim().min(2).max(120),
  email: z.email(),
  restaurantIds: z.array(z.string().min(1)).min(1),
  plan: z.enum(["TRIAL", "BASIC", "PRO"]),
  maxRestaurants: z.coerce.number().int().min(1).max(100),
  maxStorageMb: z.coerce.number().int().min(100).max(1_000_000),
});

export async function createCustomerWorkspace(
  _state: CustomerManagementState,
  formData: FormData,
): Promise<CustomerManagementState> {
  await requireOperator();
  const parsed = workspaceSchema.safeParse({
    accountName: formData.get("accountName"),
    email: formData.get("email"),
    restaurantIds: formData.getAll("restaurantIds"),
    plan: formData.get("plan"),
    maxRestaurants: formData.get("maxRestaurants"),
    maxStorageMb: formData.get("maxStorageMb"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", activationPath: null };
  }
  const existingUser = await prisma.customerUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existingUser) return { error: "That email already has customer access", activationPath: null };
  if (parsed.data.maxRestaurants < parsed.data.restaurantIds.length) {
    return {
      error: "The location limit cannot be lower than the assigned locations",
      activationPath: null,
    };
  }
  const restaurants = await prisma.restaurant.findMany({
    where: { id: { in: parsed.data.restaurantIds } },
    select: { id: true, customerAccountId: true },
  });
  if (
    restaurants.length !== parsed.data.restaurantIds.length ||
    restaurants.some((restaurant) => restaurant.customerAccountId)
  ) {
    return { error: "One or more restaurants are unavailable or already assigned", activationPath: null };
  }
  const { token, tokenHash } = await generateInvitationToken();
  await prisma.$transaction(async (tx) => {
    const account = await tx.customerAccount.create({
      data: {
        name: parsed.data.accountName,
        plan: parsed.data.plan,
        maxRestaurants: parsed.data.maxRestaurants,
        maxStorageBytes:
          BigInt(parsed.data.maxStorageMb) * BigInt(1024) * BigInt(1024),
      },
    });
    const assignment = await tx.restaurant.updateMany({
      where: { id: { in: parsed.data.restaurantIds }, customerAccountId: null },
      data: { customerAccountId: account.id },
    });
    if (assignment.count !== parsed.data.restaurantIds.length) {
      throw new Error("A restaurant was assigned by another request");
    }
    await tx.customerInvitation.create({
      data: {
        tokenHash,
        email: parsed.data.email.toLowerCase(),
        role: "OWNER",
        restaurantIds: parsed.data.restaurantIds,
        customerAccountId: account.id,
        expiresAt: new Date(Date.now() + 7 * 86_400_000),
      },
    });
  });
  revalidatePath("/dashboard/customers");
  return { error: null, activationPath: activationUrl(token) };
}

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
  restaurantId: z.string().min(1),
});

export async function inviteCustomerStaff(
  _state: CustomerManagementState,
  formData: FormData,
): Promise<CustomerManagementState> {
  const inviter = await requireCustomerUser();
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    restaurantId: formData.get("restaurantId"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email, role, and restaurant", activationPath: null };
  }
  const ownerMembership = inviter.memberships.find(
    (entry) =>
      entry.restaurantId === parsed.data.restaurantId &&
      entry.role === "OWNER",
  );
  if (!ownerMembership) {
    return { error: "Only a restaurant owner can invite staff", activationPath: null };
  }
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parsed.data.restaurantId },
    select: { customerAccountId: true },
  });
  if (!restaurant?.customerAccountId || restaurant.customerAccountId !== inviter.accountId) {
    return { error: "Restaurant access mismatch", activationPath: null };
  }
  const existingUser = await prisma.customerUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { accountId: true },
  });
  if (existingUser && existingUser.accountId !== inviter.accountId) {
    return {
      error: "That email belongs to another customer workspace",
      activationPath: null,
    };
  }
  const { token, tokenHash } = await generateInvitationToken();
  await prisma.customerInvitation.create({
    data: {
      tokenHash,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      restaurantIds: [parsed.data.restaurantId],
      customerAccountId: inviter.accountId,
      invitedByCustomerUserId: inviter.id,
      expiresAt: new Date(Date.now() + 7 * 86_400_000),
    },
  });
  revalidatePath("/portal/account");
  return { error: null, activationPath: activationUrl(token) };
}

const accountSettingsSchema = z.object({
  accountId: z.string().min(1),
  plan: z.enum(["TRIAL", "BASIC", "PRO"]),
  maxRestaurants: z.coerce.number().int().min(1).max(100),
  maxStorageMb: z.coerce.number().int().min(100).max(1_000_000),
  isActive: z.enum(["true", "false"]),
});

export async function updateCustomerAccount(
  _state: CustomerManagementState,
  formData: FormData,
): Promise<CustomerManagementState> {
  await requireOperator();
  const parsed = accountSettingsSchema.safeParse({
    accountId: formData.get("accountId"),
    plan: formData.get("plan"),
    maxRestaurants: formData.get("maxRestaurants"),
    maxStorageMb: formData.get("maxStorageMb"),
    isActive: formData.get("isActive"),
  });
  if (!parsed.success) {
    return { error: "Check the plan and limit values", activationPath: null };
  }
  const restaurantCount = await prisma.restaurant.count({
    where: { customerAccountId: parsed.data.accountId },
  });
  if (parsed.data.maxRestaurants < restaurantCount) {
    return {
      error: `This account already has ${restaurantCount} locations`,
      activationPath: null,
    };
  }
  await prisma.customerAccount.update({
    where: { id: parsed.data.accountId },
    data: {
      plan: parsed.data.plan,
      maxRestaurants: parsed.data.maxRestaurants,
      maxStorageBytes:
        BigInt(parsed.data.maxStorageMb) * BigInt(1024) * BigInt(1024),
      isActive: parsed.data.isActive === "true",
    },
  });
  revalidatePath("/dashboard/customers");
  return { error: null, activationPath: null };
}

const assignmentSchema = z.object({
  accountId: z.string().min(1),
  restaurantId: z.string().min(1),
});

export async function assignRestaurantToCustomer(
  _state: CustomerManagementState,
  formData: FormData,
): Promise<CustomerManagementState> {
  await requireOperator();
  const parsed = assignmentSchema.safeParse({
    accountId: formData.get("accountId"),
    restaurantId: formData.get("restaurantId"),
  });
  if (!parsed.success) {
    return { error: "Select an account and restaurant", activationPath: null };
  }
  const [account, restaurant] = await Promise.all([
    prisma.customerAccount.findUnique({
      where: { id: parsed.data.accountId },
      include: {
        _count: { select: { restaurants: true } },
        users: {
          where: { memberships: { some: { role: "OWNER" } } },
          select: { id: true },
        },
      },
    }),
    prisma.restaurant.findUnique({
      where: { id: parsed.data.restaurantId },
      select: { customerAccountId: true },
    }),
  ]);
  if (!account || !restaurant || restaurant.customerAccountId) {
    return { error: "That account or restaurant is unavailable", activationPath: null };
  }
  if (account._count.restaurants >= account.maxRestaurants) {
    return { error: "This account has reached its location limit", activationPath: null };
  }
  await prisma.$transaction(async (tx) => {
    await tx.restaurant.update({
      where: { id: parsed.data.restaurantId },
      data: { customerAccountId: account.id },
    });
    if (account.users.length) {
      await tx.restaurantMembership.createMany({
        data: account.users.map(({ id }) => ({
          customerUserId: id,
          restaurantId: parsed.data.restaurantId,
          role: "OWNER" as const,
        })),
        skipDuplicates: true,
      });
    }
  });
  revalidatePath("/dashboard/customers");
  revalidatePath("/portal");
  return { error: null, activationPath: null };
}

export async function unassignRestaurantFromCustomer(
  accountId: string,
  restaurantId: string,
): Promise<CustomerOperationResult> {
  await requireOperator();
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { customerAccountId: true },
  });
  if (!restaurant || restaurant.customerAccountId !== accountId) {
    return { ok: false, error: "That location is not assigned to this workspace" };
  }
  const locationCount = await prisma.restaurant.count({
    where: { customerAccountId: accountId },
  });
  if (locationCount <= 1) {
    return {
      ok: false,
      error: "Delete the workspace to release its final location",
    };
  }
  await prisma.$transaction([
    prisma.restaurantMembership.deleteMany({ where: { restaurantId } }),
    prisma.customerInvitation.deleteMany({
      where: {
        customerAccountId: accountId,
        acceptedAt: null,
        restaurantIds: { has: restaurantId },
      },
    }),
    prisma.restaurant.update({
      where: { id: restaurantId },
      data: { customerAccountId: null },
    }),
  ]);
  revalidatePath("/dashboard/customers");
  revalidatePath("/portal");
  revalidatePath("/portal/account");
  return { ok: true };
}

const membershipRoleSchema = z.enum(["OWNER", "EDITOR", "VIEWER"]);

export async function updateCustomerMembership(
  membershipId: string,
  role: string,
): Promise<CustomerOperationResult> {
  await requireOperator();
  const parsedRole = membershipRoleSchema.safeParse(role);
  if (!parsedRole.success) return { ok: false, error: "Select a valid role" };
  const membership = await prisma.restaurantMembership.findUnique({
    where: { id: membershipId },
    select: { restaurant: { select: { customerAccountId: true } } },
  });
  if (!membership?.restaurant.customerAccountId) {
    return { ok: false, error: "Membership not found" };
  }
  const currentMembership = await prisma.restaurantMembership.findUnique({
    where: { id: membershipId },
    select: { role: true, restaurantId: true },
  });
  if (
    currentMembership?.role === "OWNER" &&
    parsedRole.data !== "OWNER" &&
    (await prisma.restaurantMembership.count({
      where: { restaurantId: currentMembership.restaurantId, role: "OWNER" },
    })) <= 1
  ) {
    return { ok: false, error: "Assign another owner before changing this role" };
  }
  await prisma.restaurantMembership.update({
    where: { id: membershipId },
    data: { role: parsedRole.data },
  });
  revalidatePath("/dashboard/customers");
  revalidatePath("/portal");
  revalidatePath("/portal/account");
  return { ok: true };
}

export async function removeCustomerUser(
  accountId: string,
  userId: string,
): Promise<CustomerOperationResult> {
  await requireOperator();
  const user = await prisma.customerUser.findUnique({
    where: { id: userId },
    select: {
      accountId: true,
      memberships: {
        where: { role: "OWNER" },
        select: { restaurantId: true },
      },
    },
  });
  if (!user || user.accountId !== accountId) {
    return { ok: false, error: "User not found in this workspace" };
  }
  for (const membership of user.memberships) {
    const ownerCount = await prisma.restaurantMembership.count({
      where: { restaurantId: membership.restaurantId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      return {
        ok: false,
        error: "Assign another owner to every location before revoking this user",
      };
    }
  }
  await prisma.customerUser.delete({ where: { id: userId } });
  revalidatePath("/dashboard/customers");
  revalidatePath("/portal");
  revalidatePath("/portal/account");
  return { ok: true };
}

export async function deleteCustomerWorkspace(
  accountId: string,
  confirmationName: string,
): Promise<CustomerOperationResult> {
  await requireOperator();
  const account = await prisma.customerAccount.findUnique({
    where: { id: accountId },
    select: { name: true },
  });
  if (!account) return { ok: false, error: "Workspace not found" };
  if (confirmationName.trim() !== account.name) {
    return { ok: false, error: "The workspace name did not match" };
  }
  await prisma.$transaction(async (tx) => {
    await tx.restaurant.updateMany({
      where: { customerAccountId: accountId },
      data: { customerAccountId: null },
    });
    await tx.customerAccount.delete({ where: { id: accountId } });
  });
  revalidatePath("/dashboard/customers");
  revalidatePath("/portal");
  return { ok: true };
}

async function requireOwnedMembership(membershipId: string) {
  const customer = await requireCustomerUser();
  const membership = await prisma.restaurantMembership.findUnique({
    where: { id: membershipId },
    include: { customerUser: { select: { accountId: true } } },
  });
  if (!membership || membership.customerUser.accountId !== customer.accountId) {
    return { customer, membership: null };
  }
  const ownsRestaurant = customer.memberships.some(
    (entry) =>
      entry.restaurantId === membership.restaurantId && entry.role === "OWNER",
  );
  return { customer, membership: ownsRestaurant ? membership : null };
}

export async function updateOwnedMembership(
  membershipId: string,
  role: string,
): Promise<CustomerOperationResult> {
  const parsedRole = membershipRoleSchema.safeParse(role);
  if (!parsedRole.success) return { ok: false, error: "Select a valid role" };
  const { customer, membership } = await requireOwnedMembership(membershipId);
  if (!membership) return { ok: false, error: "You cannot manage that access" };
  if (membership.customerUserId === customer.id) {
    return { ok: false, error: "You cannot change your own access" };
  }
  if (membership.role === "OWNER" && parsedRole.data !== "OWNER") {
    const ownerCount = await prisma.restaurantMembership.count({
      where: { restaurantId: membership.restaurantId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      return { ok: false, error: "Each location must keep at least one owner" };
    }
  }
  await prisma.restaurantMembership.update({
    where: { id: membershipId },
    data: { role: parsedRole.data },
  });
  revalidatePath("/portal");
  revalidatePath("/portal/account");
  return { ok: true };
}

export async function removeOwnedMembership(
  membershipId: string,
): Promise<CustomerOperationResult> {
  const { customer, membership } = await requireOwnedMembership(membershipId);
  if (!membership) return { ok: false, error: "You cannot manage that access" };
  if (membership.customerUserId === customer.id) {
    return { ok: false, error: "You cannot remove your own access" };
  }
  if (membership.role === "OWNER") {
    const ownerCount = await prisma.restaurantMembership.count({
      where: { restaurantId: membership.restaurantId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      return { ok: false, error: "Each location must keep at least one owner" };
    }
  }
  await prisma.restaurantMembership.delete({ where: { id: membershipId } });
  revalidatePath("/portal");
  revalidatePath("/portal/account");
  return { ok: true };
}

export async function markCustomerNotificationsRead() {
  const customer = await requireCustomerUser();
  await prisma.notification.updateMany({
    where: { customerUserId: customer.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/portal");
}
