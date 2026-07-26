import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { requireOperator } from "@/lib/auth";
import { OperatorPrimaryNav } from "@/components/admin/OperatorPrimaryNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOperator();

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-6 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <UtensilsCrossed className="size-5" />
            MenuApp
          </Link>
          <OperatorPrimaryNav />
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <span className="hidden max-w-52 truncate text-sm text-muted-foreground lg:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
