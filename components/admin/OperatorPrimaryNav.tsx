"use client";

import Link from "next/link";
import { Building2, Store } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/dashboard",
    label: "Restaurants",
    icon: Store,
    active: (pathname: string) =>
      pathname === "/dashboard" || pathname.startsWith("/dashboard/restaurants"),
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: Building2,
    active: (pathname: string) => pathname.startsWith("/dashboard/customers"),
  },
];

export function OperatorPrimaryNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Operator navigation"
      className="order-3 flex w-full items-center gap-1 border-t py-2 md:order-none md:w-auto md:border-0 md:py-0"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.active(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
