import Link from "next/link";
import { Building2, UtensilsCrossed } from "lucide-react";
import { requireOperator } from "@/lib/auth";
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
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <UtensilsCrossed className="size-5" />
            MenuApp
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/customers" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:flex">
              <Building2 className="size-4" />
              Customers
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
