import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const CUSTOMER_SESSION_COOKIE = "menufy_customer_session";
const SESSION_DAYS = 30;

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(expires ? { expires } : {}),
  };
}

export async function createCustomerSession(customerUserId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await prisma.customerSession.create({
    data: { customerUserId, tokenHash: tokenHash(token), expiresAt },
  });
  (await cookies()).set(
    CUSTOMER_SESSION_COOKIE,
    token,
    cookieOptions(expiresAt),
  );
}

export async function deleteCustomerSession() {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.customerSession
      .deleteMany({ where: { tokenHash: tokenHash(token) } })
      .catch(() => undefined);
  }
  store.set(CUSTOMER_SESSION_COOKIE, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  });
}

export async function getCustomerUser() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: {
      customerUser: {
        include: {
          account: true,
          memberships: true,
        },
      },
    },
  });
  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.customerUser.isActive ||
    !session.customerUser.account.isActive
  ) {
    return null;
  }
  return session.customerUser;
}

export async function requireCustomerUser() {
  const user = await getCustomerUser();
  if (!user) redirect("/portal/login");
  return user;
}
