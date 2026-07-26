import Link from "next/link";
import { Building2, ClipboardCheck, LogOut, Settings } from "lucide-react";
import { logoutCustomer } from "@/lib/actions/customer-auth";
import { requireCustomerUser } from "@/lib/customer-auth";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomerUser();
  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <Link href="/portal" className="flex items-center gap-2 font-semibold"><Building2 className="size-5" /> {user.account.name}</Link>
          <nav className="flex items-center gap-2">
            <Button size="sm" variant="ghost" nativeButton={false} render={<Link href="/portal/welcome" />}><ClipboardCheck className="size-4" /> Setup</Button>
            <Button size="sm" variant="ghost" nativeButton={false} render={<Link href="/portal/account" />}><Settings className="size-4" /> Account</Button>
            <form action={logoutCustomer}><Button type="submit" size="sm" variant="ghost"><LogOut className="size-4" /> Sign out</Button></form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
