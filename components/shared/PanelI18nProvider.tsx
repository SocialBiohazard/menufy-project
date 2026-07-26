"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  panelDirection,
  translatePanel,
  type PanelLocale,
} from "@/lib/panel-i18n-shared";

type PanelI18nValue = {
  locale: PanelLocale;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
};

const PanelI18nContext = createContext<PanelI18nValue | null>(null);

export function PanelI18nProvider({
  locale,
  children,
}: {
  locale: PanelLocale;
  children: ReactNode;
}) {
  const value = useMemo<PanelI18nValue>(
    () => ({
      locale,
      dir: panelDirection(locale),
      t: (key) => translatePanel(locale, key),
    }),
    [locale],
  );

  return (
    <PanelI18nContext.Provider value={value}>
      <div lang={locale} dir={value.dir} className="min-h-dvh">
        {children}
      </div>
    </PanelI18nContext.Provider>
  );
}

export function usePanelI18n() {
  const value = useContext(PanelI18nContext);
  if (!value) {
    throw new Error("usePanelI18n must be used inside PanelI18nProvider");
  }
  return value;
}

