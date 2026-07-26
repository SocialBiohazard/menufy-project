import "server-only";

import { cookies } from "next/headers";
import {
  isPanelLocale,
  translatePanel,
  type PanelLocale,
} from "@/lib/panel-i18n-shared";

export const PANEL_LOCALE_COOKIE = "menuapp-panel-locale";

export async function getPanelLocale(): Promise<PanelLocale> {
  const value = (await cookies()).get(PANEL_LOCALE_COOKIE)?.value;
  return isPanelLocale(value) ? value : "en";
}

export async function getPanelI18n() {
  const locale = await getPanelLocale();
  return {
    locale,
    t: (key: string) => translatePanel(locale, key),
  };
}

