import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import { ActivationForm } from "@/components/customer/ActivationForm";
import { prisma } from "@/lib/prisma";

export default async function ActivatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await prisma.customerInvitation.findUnique({
    where: { tokenHash: createHash("sha256").update(token).digest("hex") },
    select: { email: true, acceptedAt: true, expiresAt: true },
  });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) notFound();
  return <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4"><ActivationForm token={token} email={invitation.email} /></main>;
}
