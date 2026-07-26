"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createOperatorSession,
  deleteOperatorSession,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-password";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { isOperatorEmail } from "@/lib/operator-access";
import { prisma } from "@/lib/prisma";

export type LoginState = { error: string | null };

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export async function loginOperator(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid email or password" };

  const email = parsed.data.email.trim().toLowerCase();
  const rateLimitKey = `operator:${email}`;
  if (isLoginBlocked(rateLimitKey)) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const operator = isOperatorEmail(email)
    ? await prisma.operator.findUnique({ where: { email } })
    : null;
  const valid =
    operator?.isActive &&
    (await verifyPassword(parsed.data.password, operator.passwordHash));

  if (!valid || !operator) {
    recordLoginFailure(rateLimitKey);
    return { error: "Invalid email or password" };
  }

  clearLoginFailures(rateLimitKey);
  await prisma.operatorSession.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  await createOperatorSession(operator.id);
  redirect("/dashboard");
}

export async function logoutOperator(): Promise<void> {
  await deleteOperatorSession();
  redirect("/login");
}
