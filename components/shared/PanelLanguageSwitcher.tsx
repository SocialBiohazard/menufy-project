"use client";

import { Languages } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          disabled={pending}
          aria-label={`${t("Interface language")}: ${PANEL_LOCALE_LABELS[locale]}`}
          title={t("Interface language")}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Languages className="size-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2">
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(value) => void changeLocale(value as PanelLocale)}
            className="grid grid-cols-2 gap-1"
          >
            {PANEL_LOCALES.map((value) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                closeOnClick
                className="min-h-9 text-xs"
              >
                {PANEL_LOCALE_LABELS[value]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <label
      className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      title={t("Interface language")}
    >
      <Languages className="size-4 shrink-0" aria-hidden="true" />
      <span className="hidden xl:inline">{t("Interface language")}</span>
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
