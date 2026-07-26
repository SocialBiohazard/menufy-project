import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isOperatorEmail } from "@/lib/operator-access";

export const SESSION_COOKIE = "menuapp_session";
const SESSION_DAYS = 30;

function sessionHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(expires ? { expires } : {}),
  };
}

export async function createOperatorSession(operatorId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.operatorSession.create({
    data: {
      operatorId,
      tokenHash: sessionHash(token),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function deleteOperatorSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.operatorSession
      .deleteMany({ where: { tokenHash: sessionHash(token) } })
      .catch(() => undefined);
  }
  cookieStore.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(new Date(0)),
    maxAge: 0,
  });
}

/** Current explicitly allowlisted, active operator, or null. */
export async function getOperator() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.operatorSession.findUnique({
    where: { tokenHash: sessionHash(token) },
    include: { operator: true },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.operator.isActive ||
    !isOperatorEmail(session.operator.email)
  ) {
    return null;
  }

  return {
    id: session.operator.id,
    email: session.operator.email,
  };
}

/** Require an explicitly allowlisted operator; redirect to /login otherwise. */
export async function requireOperator() {
  const operator = await getOperator();
  if (!operator) redirect("/login?error=unauthorized");
  return operator;
}
