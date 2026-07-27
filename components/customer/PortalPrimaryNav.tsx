"use client";

import Link from "next/link";
import { ClipboardCheck, LayoutDashboard, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

const items = [
  {
    href: "/portal",
    label: "Overview",
    icon: LayoutDashboard,
    active: (pathname: string) =>
      pathname === "/portal" || pathname.startsWith("/portal/restaurants"),
  },
  {
    href: "/portal/welcome",
    label: "Setup guide",
    icon: ClipboardCheck,
    active: (pathname: string) => pathname === "/portal/welcome",
  },
  {
    href: "/portal/account",
    label: "Account",
    icon: Settings,
    active: (pathname: string) => pathname === "/portal/account",
  },
];

export function PortalPrimaryNav({ showSetup }: { showSetup: boolean }) {
  const pathname = usePathname();
  const { t } = usePanelI18n();

  return (
    <nav
      aria-label="Customer portal navigation"
      className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t py-2 md:order-none md:w-auto md:border-0 md:py-0"
    >
      {items
        .filter((item) => showSetup || item.href !== "/portal/welcome")
        .map((item) => {
        const Icon = item.icon;
        const isActive = item.active(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {t(item.label)}
          </Link>
        );
        })}
    </nav>
  );
}
