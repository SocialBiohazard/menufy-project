"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createCustomerSession, deleteCustomerSession, requireCustomerUser } from "@/lib/customer-auth";
import { hashPassword, passwordValidationError, verifyPassword } from "@/lib/auth-password";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { prisma } from "@/lib/prisma";

export type CustomerAuthState = { error: string | null };

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export async function loginCustomer(
  _state: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid email or password" };
  const email = parsed.data.email.trim().toLowerCase();
  const rateLimitKey = `customer:${email}`;
  if (isLoginBlocked(rateLimitKey)) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }
  const user = await prisma.customerUser.findUnique({
    where: { email },
    include: { account: true },
  });
  if (
    !user?.isActive ||
    !user.account.isActive ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    recordLoginFailure(rateLimitKey);
    return { error: "Invalid email or password" };
  }
  clearLoginFailures(rateLimitKey);
  await prisma.customerSession.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  await createCustomerSession(user.id);
  redirect("/portal");
}

export async function logoutCustomer() {
  await deleteCustomerSession();
  redirect("/portal/login");
}

export async function activateCustomer(
  _state: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const validationError = passwordValidationError(password);
  if (!token || validationError) {
    return { error: validationError ?? "Invalid activation link" };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invitation = await prisma.customerInvitation.findUnique({
    where: { tokenHash },
    include: { customerAccount: true },
  });
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.expiresAt <= new Date() ||
    !invitation.customerAccount.isActive
  ) {
    return { error: "This activation link is invalid or expired" };
  }
  const existingUser = await prisma.customerUser.findUnique({
    where: { email: invitation.email },
    select: { accountId: true },
  });
  if (existingUser) {
    return {
      error: "This account is already active. Sign in instead of using an activation link.",
    };
  }

  const assignedRestaurantCount = await prisma.restaurant.count({
    where: {
      id: { in: invitation.restaurantIds },
      customerAccountId: invitation.customerAccountId,
    },
  });
  if (assignedRestaurantCount !== invitation.restaurantIds.length) {
    return { error: "This invitation no longer matches the assigned restaurants" };
  }

  const passwordHash = await hashPassword(password);
  let user: { id: string };
  try {
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.customerUser.create({
        data: {
        email: invitation.email,
        accountId: invitation.customerAccountId,
        passwordHash,
      },
      });
      for (const restaurantId of invitation.restaurantIds) {
        await tx.restaurantMembership.create({
          data: {
            customerUserId: created.id,
            restaurantId,
            role: invitation.role,
          },
        });
      }
      await tx.customerInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });
      const operators = await tx.operator.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      if (operators.length) {
        await tx.notification.createMany({
          data: operators.map(({ id }) => ({
            operatorId: id,
            type: "CUSTOMER_ACTIVATED",
            title: `${invitation.email} activated customer access`,
          })),
        });
      }
      return created;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "This account is already active. Sign in instead of using an activation link.",
      };
    }
    throw error;
  }
  await createCustomerSession(user.id);
  redirect("/portal/welcome");
}

export async function changeCustomerPassword(
  _state: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const user = await requireCustomerUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const validationError = passwordValidationError(newPassword);
  if (validationError) return { error: validationError };
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { error: "Current password is incorrect" };
  }
  await prisma.customerUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
      sessions: { deleteMany: {} },
    },
  });
  await deleteCustomerSession();
  redirect("/portal/login?changed=1");
}

export async function generateInvitationToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
  };
}
