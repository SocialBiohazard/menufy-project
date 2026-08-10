export const LANGS = ["tr", "en", "ar", "ru", "de", "fr", "es", "it", "pl", "zh"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  tr: "TR",
  en: "EN",
  ar: "AR",
  ru: "RU",
  de: "DE",
  fr: "FR",
  es: "ES",
  it: "IT",
  pl: "PL",
  zh: "ZH",
};

export const LANGUAGE_NAMES: Record<Lang, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  ru: "Русский",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pl: "Polski",
  zh: "简体中文",
};

export const LANGUAGE_SUFFIX: Record<Exclude<Lang, "tr">, string> = {
  en: "En", ar: "Ar", ru: "Ru", de: "De", fr: "Fr",
  es: "Es", it: "It", pl: "Pl", zh: "Zh",
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
  const suffix = LANGUAGE_SUFFIX[lang];
  const translated = obj[`${base}${suffix}`] as string | null | undefined;
  return translated && translated.length > 0 ? translated : tr;
}

/** Prices are stored in whole currency units. */
export function formatPrice(price: number, currencyCode = "TRY", lang: Lang = "tr"): string {
  const locales: Record<Lang, string> = {
    tr: "tr-TR", en: "en", ar: "ar", ru: "ru-RU", de: "de-DE",
    fr: "fr-FR", es: "es-ES", it: "it-IT", pl: "pl-PL", zh: "zh-CN",
  };
  const locale = locales[lang];
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

const ALLERGEN_FALLBACKS: Partial<Record<Lang, string[]>> = {
  de: ["Glutenhaltiges Getreide", "Krebstiere", "Eier", "Fisch", "Erdnüsse", "Sojabohnen", "Milch", "Schalenfrüchte", "Sellerie", "Senf", "Sesamsamen", "Schwefeldioxid und Sulfite", "Lupinen", "Weichtiere"],
  fr: ["Céréales contenant du gluten", "Crustacés", "Œufs", "Poisson", "Arachides", "Soja", "Lait", "Fruits à coque", "Céleri", "Moutarde", "Graines de sésame", "Anhydride sulfureux et sulfites", "Lupin", "Mollusques"],
  es: ["Cereales con gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja", "Leche", "Frutos de cáscara", "Apio", "Mostaza", "Semillas de sésamo", "Dióxido de azufre y sulfitos", "Altramuces", "Moluscos"],
  it: ["Cereali contenenti glutine", "Crostacei", "Uova", "Pesce", "Arachidi", "Soia", "Latte", "Frutta a guscio", "Sedano", "Senape", "Semi di sesamo", "Anidride solforosa e solfiti", "Lupini", "Molluschi"],
  pl: ["Zboża zawierające gluten", "Skorupiaki", "Jaja", "Ryby", "Orzeszki ziemne", "Soja", "Mleko", "Orzechy", "Seler", "Gorczyca", "Nasiona sezamu", "Dwutlenek siarki i siarczyny", "Łubin", "Mięczaki"],
  zh: ["含麸质的谷物", "甲壳类", "蛋类", "鱼类", "花生", "大豆", "牛奶", "坚果", "芹菜", "芥末", "芝麻", "二氧化硫和亚硫酸盐", "羽扇豆", "软体动物"],
};

export function allergenName(obj: object, lang: Lang): string {
  const values = obj as Record<string, unknown>;
  const tr = (values.nameTr as string | null | undefined) ?? "";
  if (lang === "tr") return tr;
  const translated = values[`name${LANGUAGE_SUFFIX[lang]}`] as string | null | undefined;
  if (translated && translated.length > 0) return translated;
  const id = Number(values.id);
  return ALLERGEN_FALLBACKS[lang]?.[id - 1] || ((values.nameEn as string | null | undefined) || tr);
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
  ru: {
    allergens: "Аллергены",
    unavailable: "Нет в наличии",
    new: "Новинка",
    featured: "Рекомендуем",
    menu: "Меню",
    emptyMenu: "Меню скоро появится.",
    contains: "Содержит",
  },
  de: { allergens: "Allergene", unavailable: "Ausverkauft", new: "Neu", featured: "Empfohlen", menu: "Menü", emptyMenu: "Das Menü folgt in Kürze.", contains: "Enthält" },
  fr: { allergens: "Allergènes", unavailable: "Épuisé", new: "Nouveau", featured: "Recommandé", menu: "Menu", emptyMenu: "Le menu sera bientôt disponible.", contains: "Contient" },
  es: { allergens: "Alérgenos", unavailable: "Agotado", new: "Nuevo", featured: "Destacado", menu: "Menú", emptyMenu: "El menú estará disponible pronto.", contains: "Contiene" },
  it: { allergens: "Allergeni", unavailable: "Esaurito", new: "Nuovo", featured: "In evidenza", menu: "Menù", emptyMenu: "Il menù sarà disponibile a breve.", contains: "Contiene" },
  pl: { allergens: "Alergeny", unavailable: "Wyprzedane", new: "Nowość", featured: "Polecane", menu: "Menu", emptyMenu: "Menu pojawi się wkrótce.", contains: "Zawiera" },
  zh: { allergens: "过敏原", unavailable: "已售罄", new: "新品", featured: "推荐", menu: "菜单", emptyMenu: "菜单即将上线。", contains: "含有" },
};
