import Link from "next/link";
import { Building2, LogOut } from "lucide-react";
import { logoutCustomer } from "@/lib/actions/customer-auth";
import { requireCustomerUser } from "@/lib/customer-auth";
import { PortalPrimaryNav } from "@/components/customer/PortalPrimaryNav";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomerUser();
  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-6 px-4">
          <Link href="/portal" className="flex min-w-0 items-center gap-2 font-semibold">
            <Building2 className="size-5 shrink-0" />
            <span className="max-w-48 truncate">{user.account.name}</span>
          </Link>
          <PortalPrimaryNav />
          <form action={logoutCustomer} className="ml-auto">
            <Button type="submit" size="sm" variant="ghost">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
