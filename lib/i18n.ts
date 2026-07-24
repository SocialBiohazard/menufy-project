export type Lang = "tr" | "en" | "ar";

export const LANG_LABELS: Record<Lang, string> = {
  tr: "TR",
  en: "EN",
  ar: "AR",
};

export const RTL_LANGS: Lang[] = ["ar"];
export const isRtl = (lang: Lang) => RTL_LANGS.includes(lang);

/**
 * Pick a localized string. `base` is the TR field name (e.g. "name"); EN/AR live
 * on `${base}En` / `${base}Ar`. Falls back to TR when a translation is missing.
 */
export function pick<T extends Record<string, unknown>>(
  obj: T,
  base: string,
  lang: Lang,
): string {
  const tr = (obj[base] as string | null | undefined) ?? "";
  if (lang === "tr") return tr;
  const suffix = lang === "en" ? "En" : "Ar";
  const translated = obj[`${base}${suffix}`] as string | null | undefined;
  return translated && translated.length > 0 ? translated : tr;
}

/** Prices are stored in whole currency units. */
export function formatPrice(price: number, currencyCode = "TRY", lang: Lang = "tr"): string {
  const locale = lang === "ar" ? "ar" : lang === "en" ? "en" : "tr-TR";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${new Intl.NumberFormat(locale).format(price)} ${currencyCode}`;
  }
}

type UiKey = "allergens" | "unavailable" | "new" | "featured" | "menu" | "emptyMenu" | "contains";

export const UI: Record<Lang, Record<UiKey, string>> = {
  tr: {
    allergens: "Alerjenler",
    unavailable: "Tükendi",
    new: "Yeni",
    featured: "Öne Çıkan",
    menu: "Menü",
    emptyMenu: "Menü yakında eklenecek.",
    contains: "İçerir",
  },
  en: {
    allergens: "Allergens",
    unavailable: "Sold out",
    new: "New",
    featured: "Featured",
    menu: "Menu",
    emptyMenu: "Menu coming soon.",
    contains: "Contains",
  },
  ar: {
    allergens: "مسببات الحساسية",
    unavailable: "نفد",
    new: "جديد",
    featured: "مميز",
    menu: "القائمة",
    emptyMenu: "ستُضاف القائمة قريبًا.",
    contains: "يحتوي على",
  },
};
