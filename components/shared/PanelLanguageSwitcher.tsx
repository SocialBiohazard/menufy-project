"use client";

import { Languages } from "lucide-react";
import { useState } from "react";
import {
  PANEL_LOCALES,
  PANEL_LOCALE_LABELS,
  type PanelLocale,
} from "@/lib/panel-i18n-shared";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

export function PanelLanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, t } = usePanelI18n();
  const [pending, setPending] = useState(false);

  async function changeLocale(nextLocale: PanelLocale) {
    if (nextLocale === locale) return;
    setPending(true);
    try {
      const response = await fetch("/api/panel-locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!response.ok) throw new Error("Could not save language");
      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <label
      className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      title={t("Interface language")}
    >
      <Languages className="size-4 shrink-0" aria-hidden="true" />
      {!compact && <span className="hidden xl:inline">{t("Interface language")}</span>}
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => void changeLocale(event.target.value as PanelLocale)}
        aria-label={t("Interface language")}
        className="h-9 rounded-md border bg-background px-2 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {PANEL_LOCALES.map((value) => (
          <option key={value} value={value}>
            {PANEL_LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
