import { createHash } from "node:crypto";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { ActivationForm } from "@/components/customer/ActivationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
    const message = !invitation
      ? "This activation link is invalid."
      : invitation.acceptedAt
        ? "This activation link has already been used."
        : "This activation link has expired.";
    return (
      <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CircleAlert className="mb-2 size-8 text-amber-600" />
            <CardTitle>Activation link unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {message} Ask your workspace owner for a new invitation if you
              still need access.
            </p>
            <Button nativeButton={false} render={<Link href="/portal/login" />}>
              Go to customer login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  return <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4"><ActivationForm token={token} email={invitation.email} /></main>;
}
