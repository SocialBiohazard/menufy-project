import Link from "next/link";
import { Building2 } from "lucide-react";
import { requireCustomerUser } from "@/lib/customer-auth";
import { PortalPrimaryNav } from "@/components/customer/PortalPrimaryNav";
import { PanelI18nProvider } from "@/components/shared/PanelI18nProvider";
import { PanelLanguageSwitcher } from "@/components/shared/PanelLanguageSwitcher";
import { CustomerSignOutButton } from "@/components/customer/CustomerSignOutButton";
import { Toaster } from "@/components/ui/sonner";
import { getPanelLocale } from "@/lib/panel-i18n";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomerUser();
  const locale = await getPanelLocale();
  return (
    <PanelI18nProvider locale={locale}>
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-6 px-4">
          <Link href="/portal" className="flex min-w-0 items-center gap-2 font-semibold">
            <Building2 className="size-5 shrink-0" />
            <span className="max-w-48 truncate">{user.account.name}</span>
          </Link>
          <PortalPrimaryNav
            showSetup={user.memberships.some(
              (membership) => membership.role !== "VIEWER",
            )}
          />
          <div className="ml-auto flex items-center gap-2">
          <PanelLanguageSwitcher compact />
          <CustomerSignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
    </PanelI18nProvider>
  );
}
