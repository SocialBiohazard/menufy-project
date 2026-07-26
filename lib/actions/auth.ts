"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createOperatorSession,
  deleteOperatorSession,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-password";
import { isOperatorEmail } from "@/lib/operator-access";
import { prisma } from "@/lib/prisma";

export type LoginState = { error: string | null };

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

const attempts = new Map<
  string,
  { count: number; windowStartedAt: number; blockedUntil: number }
>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

function isBlocked(key: string, now: number) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.blockedUntil > now) return true;
  if (now - entry.windowStartedAt >= WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return false;
}

function recordFailure(key: string, now: number) {
  const current = attempts.get(key);
  const entry =
    !current || now - current.windowStartedAt >= WINDOW_MS
      ? { count: 0, windowStartedAt: now, blockedUntil: 0 }
      : current;
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.blockedUntil = now + WINDOW_MS;
  attempts.set(key, entry);
}

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
  const now = Date.now();
  if (isBlocked(email, now)) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const operator = isOperatorEmail(email)
    ? await prisma.operator.findUnique({ where: { email } })
    : null;
  const valid =
    operator?.isActive &&
    (await verifyPassword(parsed.data.password, operator.passwordHash));

  if (!valid || !operator) {
    recordFailure(email, now);
    return { error: "Invalid email or password" };
  }

  attempts.delete(email);
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
