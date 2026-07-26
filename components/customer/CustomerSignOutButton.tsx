"use client";

import { LogOut } from "lucide-react";
import { logoutCustomer } from "@/lib/actions/customer-auth";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";
import { Button } from "@/components/ui/button";

export function CustomerSignOutButton() {
  const { t } = usePanelI18n();
  return (
    <form action={logoutCustomer}>
      <Button type="submit" size="sm" variant="ghost">
        <LogOut className="size-4" />
        <span className="hidden sm:inline">{t("Sign out")}</span>
      </Button>
    </form>
  );
}
