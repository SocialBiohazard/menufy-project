import type { Lang } from "@/lib/i18n";

export type InciNavigationView = {
  entered: boolean;
  categoryId: string | null;
  itemId: string | null;
  lang: Lang;
};

type CategoryIndex = {
  id: string;
  itemIds: string[];
};

export function readInciNavigation(
  search: URLSearchParams,
  categories: CategoryIndex[],
  enabledLangs: Lang[],
  defaultLang: Lang,
  splashEnabled: boolean,
): InciNavigationView {
  const requestedCategory = search.get("category");
  const requestedItem = search.get("item");
  const itemCategory = requestedItem
    ? categories.find((category) => category.itemIds.includes(requestedItem))
    : undefined;
  const category = itemCategory ??
    categories.find((entry) => entry.id === requestedCategory);
  const requestedLang = search.get("lang") as Lang | null;

  return {
    entered: !splashEnabled || search.get("screen") === "menu" || Boolean(category),
    categoryId: category?.id ?? null,
    itemId: itemCategory ? requestedItem : null,
    lang: requestedLang && enabledLangs.includes(requestedLang)
      ? requestedLang
      : defaultLang,
  };
}

export function writeInciNavigation(
  currentSearch: URLSearchParams,
  view: InciNavigationView,
  defaultLang: Lang,
): string {
  const next = new URLSearchParams(currentSearch);
  next.delete("screen");
  next.delete("category");
  next.delete("item");
  next.delete("lang");

  if (view.entered) next.set("screen", "menu");
  if (view.categoryId) next.set("category", view.categoryId);
  if (view.itemId) next.set("item", view.itemId);
  if (view.lang !== defaultLang) next.set("lang", view.lang);

  const value = next.toString();
  return value ? `?${value}` : "";
}
