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

function activationUrl(token: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  return origin ? `${origin}/activate/${token}` : `/activate/${token}`;
}

const workspaceSchema = z.object({
  accountName: z.string().trim().min(2).max(120),
  email: z.email(),
  restaurantId: z.string().min(1),
});

export async function createCustomerWorkspace(
  _state: CustomerManagementState,
  formData: FormData,
): Promise<CustomerManagementState> {
  await requireOperator();
  const parsed = workspaceSchema.safeParse({
    accountName: formData.get("accountName"),
    email: formData.get("email"),
    restaurantId: formData.get("restaurantId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", activationPath: null };
  }
  const existingUser = await prisma.customerUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existingUser) return { error: "That email already has customer access", activationPath: null };
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: parsed.data.restaurantId },
    select: { customerAccountId: true },
  });
  if (!restaurant || restaurant.customerAccountId) {
    return { error: "Restaurant is unavailable or already assigned", activationPath: null };
  }
  const { token, tokenHash } = await generateInvitationToken();
  await prisma.$transaction(async (tx) => {
    const account = await tx.customerAccount.create({
      data: { name: parsed.data.accountName },
    });
    await tx.restaurant.update({
      where: { id: parsed.data.restaurantId },
      data: { customerAccountId: account.id },
    });
    await tx.customerInvitation.create({
      data: {
        tokenHash,
        email: parsed.data.email.toLowerCase(),
        role: "OWNER",
        restaurantIds: [parsed.data.restaurantId],
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

export async function markCustomerNotificationsRead() {
  const customer = await requireCustomerUser();
  await prisma.notification.updateMany({
    where: { customerUserId: customer.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/portal");
}
