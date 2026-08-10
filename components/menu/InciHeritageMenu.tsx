"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import type { MenuData, MenuItem } from "@/lib/menu";
import { isManagedMediaUrl } from "@/lib/media-url";
import { formatPrice, isRtl, LANG_LABELS, pick, type Lang } from "@/lib/i18n";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RestaurantFooter } from "@/components/menu/RestaurantFooter";
import { themeToCssVars, type ThemeTokens } from "@/lib/themes";
import {
  readInciNavigation,
  writeInciNavigation,
  type InciNavigationView,
} from "@/lib/inci-navigation";

const COPY = {
  tr: {
    enter: "Menüyü keşfet",
    menu: "Menü",
    categories: "Kategoriler",
    products: "ürün",
    back: "Kategorilere dön",
    details: "Detayları gör",
    portion: "Porsiyon",
    ingredients: "İçindekiler",
    nutrition: "Besin değerleri",
    allergens: "Alerjenler",
    estimated: "tahmini",
    address: "Yol tarifi",
    call: "Ara",
    reviews: "Yorumlar",
    website: "Web sitesi",
    whatsapp: "WhatsApp",
    priceUpdated: "Fiyat güncelleme",
    since: "Kuruluş",
    empty: "Bu kategori yakında güncellenecek.",
    emptyMenu: "Menümüz hazırlanıyor. Çok yakında burada.",
    unavailable: "Şu anda mevcut değil",
    new: "Yeni",
    featured: "Öne çıkan",
  },
  en: {
    enter: "Explore the menu",
    menu: "Menu",
    categories: "Categories",
    products: "items",
    back: "Back to categories",
    details: "View details",
    portion: "Portion",
    ingredients: "Ingredients",
    nutrition: "Nutrition",
    allergens: "Allergens",
    estimated: "estimated",
    address: "Directions",
    call: "Call",
    reviews: "Reviews",
    website: "Website",
    whatsapp: "WhatsApp",
    priceUpdated: "Price update",
    since: "Since",
    empty: "This category will be updated soon.",
    emptyMenu: "Our menu is being prepared and will be here soon.",
    unavailable: "Currently unavailable",
    new: "New",
    featured: "Featured",
  },
  ar: {
    enter: "استكشف القائمة",
    menu: "القائمة",
    categories: "الأقسام",
    products: "منتجات",
    back: "العودة إلى الأقسام",
    details: "عرض التفاصيل",
    portion: "الحصة",
    ingredients: "المكونات",
    nutrition: "القيم الغذائية",
    allergens: "مسببات الحساسية",
    estimated: "تقديري",
    address: "الاتجاهات",
    call: "اتصال",
    reviews: "التقييمات",
    website: "الموقع",
    whatsapp: "واتساب",
    priceUpdated: "تحديث الأسعار",
    since: "منذ",
    empty: "سيتم تحديث هذا القسم قريبًا.",
    emptyMenu: "يتم إعداد قائمتنا وستتوفر هنا قريبًا.",
    unavailable: "غير متوفر حاليًا",
    new: "جديد",
    featured: "مميز",
  },
  ru: {
    enter: "Открыть меню",
    menu: "Меню",
    categories: "Категории",
    products: "позиций",
    back: "Назад к категориям",
    details: "Подробнее",
    portion: "Порция",
    ingredients: "Состав",
    nutrition: "Пищевая ценность",
    allergens: "Аллергены",
    estimated: "примерно",
    address: "Маршрут",
    call: "Позвонить",
    reviews: "Отзывы",
    website: "Веб-сайт",
    whatsapp: "WhatsApp",
    priceUpdated: "Цены обновлены",
    since: "С",
    empty: "Эта категория скоро будет обновлена.",
    emptyMenu: "Наше меню готовится и скоро появится здесь.",
    unavailable: "Сейчас недоступно",
    new: "Новинка",
    featured: "Рекомендуем",
  },
} satisfies Record<Lang, Record<string, string>>;

const FALLBACK_BACKGROUND = "/templates/inci-heritage/background.webp";
const CATEGORY_FALLBACKS = [
  "radial-gradient(circle at 82% 14%, #d5a95d66 0 8%, transparent 30%), linear-gradient(145deg, #8d2b3b, #3e0c14)",
  "radial-gradient(ellipse at 15% 18%, #e1bb7652 0 10%, transparent 34%), linear-gradient(155deg, #70202d, #2f0a10)",
  "radial-gradient(circle at 75% 78%, #bd785c55 0 12%, transparent 36%), linear-gradient(130deg, #963346, #451019)",
  "radial-gradient(ellipse at 26% 72%, #d5a95d4d 0 8%, transparent 32%), linear-gradient(160deg, #5b1420, #8c2939)",
  "radial-gradient(circle at 78% 18%, #f0cf8d52 0 7%, transparent 28%), linear-gradient(135deg, #7b2030, #350a11)",
  "radial-gradient(ellipse at 20% 22%, #b96e565c 0 10%, transparent 35%), linear-gradient(150deg, #922f40, #4b111a)",
];

const NUTRITION_LABELS: Record<Lang, Record<string, string>> = {
  tr: { protein: "Protein", fat: "Yağ", saturated: "Doymuş yağ", carbs: "Karbonhidrat", sugar: "Şeker", fiber: "Lif", salt: "Tuz" },
  en: { protein: "Protein", fat: "Fat", saturated: "Saturated fat", carbs: "Carbohydrate", sugar: "Sugar", fiber: "Fiber", salt: "Salt" },
  ar: { protein: "البروتين", fat: "الدهون", saturated: "دهون مشبعة", carbs: "الكربوهيدرات", sugar: "السكر", fiber: "الألياف", salt: "الملح" },
  ru: { protein: "Белки", fat: "Жиры", saturated: "Насыщенные жиры", carbs: "Углеводы", sugar: "Сахар", fiber: "Клетчатка", salt: "Соль" },
};

const NUTRITION_BASIS: Record<Lang, Record<string, string>> = {
  tr: { "100g": "100 g için", "100ml": "100 ml için", "per portion": "porsiyon başına" },
  en: { "100g": "per 100 g", "100ml": "per 100 ml", "per portion": "per portion" },
  ar: { "100g": "لكل 100 غ", "100ml": "لكل 100 مل", "per portion": "لكل حصة" },
  ru: { "100g": "на 100 г", "100ml": "на 100 мл", "per portion": "на порцию" },
};

export function InciHeritageMenu({
  menu,
  theme,
  enabledLangs,
  defaultLang,
}: {
  menu: MenuData;
  theme: ThemeTokens;
  enabledLangs: Lang[];
  defaultLang: Lang;
}) {
  const [lang, setLang] = useState(defaultLang);
  const [entered, setEntered] = useState(!menu.splashEnabled);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const contentHeadingRef = useRef<HTMLHeadingElement>(null);
  const rtl = isRtl(lang);
  const t = COPY[lang];
  const themeStyle = themeToCssVars(theme);

  const categories = menu.categories;
  const category = categories.find((entry) => entry.id === categoryId) ?? null;
  const logo = menu.logo;
  const background = menu.splashImage || menu.coverImage || FALLBACK_BACKGROUND;
  const slogan = pick(menu, "slogan", lang) || menu.businessType || "";
  const categoryIndex = useMemo(
    () => categories.map((entry) => ({
      id: entry.id,
      itemIds: entry.items.map((item) => item.id),
    })),
    [categories],
  );

  const applyView = useCallback((view: InciNavigationView) => {
    setEntered(view.entered);
    setCategoryId(view.categoryId);
    setSelectedItem(
      view.itemId
        ? menu.categories.flatMap((entry) => entry.items).find((item) => item.id === view.itemId) ?? null
        : null,
    );
    setLang(view.lang);
  }, [menu.categories]);

  const updateView = useCallback((
    changes: Partial<InciNavigationView>,
    mode: "push" | "replace" = "push",
  ) => {
    const current: InciNavigationView = {
      entered,
      categoryId,
      itemId: selectedItem?.id ?? null,
      lang,
      ...changes,
    };
    const search = writeInciNavigation(
      new URLSearchParams(window.location.search),
      current,
      defaultLang,
    );
    const depth = Number(window.history.state?.inciDepth ?? 0);
    const state = { ...window.history.state, inciDepth: mode === "push" ? depth + 1 : depth };
    window.history[mode === "push" ? "pushState" : "replaceState"](
      state,
      "",
      `${window.location.pathname}${search}${window.location.hash}`,
    );
    applyView(current);
  }, [applyView, categoryId, defaultLang, entered, lang, selectedItem?.id]);

  const closeOneLevel = useCallback((fallback: Partial<InciNavigationView>) => {
    const depth = Number(window.history.state?.inciDepth ?? 0);
    if (depth > 0) {
      window.history.back();
    } else {
      updateView(fallback, "replace");
    }
  }, [updateView]);

  useEffect(() => {
    const syncFromLocation = () => {
      applyView(readInciNavigation(
        new URLSearchParams(window.location.search),
        categoryIndex,
        enabledLangs,
        defaultLang,
        menu.splashEnabled,
      ));
    };
    const initial = readInciNavigation(
      new URLSearchParams(window.location.search),
      categoryIndex,
      enabledLangs,
      defaultLang,
      menu.splashEnabled,
    );
    window.history.replaceState(
      { ...window.history.state, inciDepth: Number(window.history.state?.inciDepth ?? 0) },
      "",
      `${window.location.pathname}${writeInciNavigation(
        new URLSearchParams(window.location.search),
        initial,
        defaultLang,
      )}${window.location.hash}`,
    );
    queueMicrotask(() => applyView(initial));
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [applyView, categoryIndex, defaultLang, enabledLangs, menu.splashEnabled]);

  useEffect(() => {
    if (entered) contentHeadingRef.current?.focus({ preventScroll: true });
  }, [categoryId, entered]);

  if (!entered) {
    return (
      <div
        dir={rtl ? "rtl" : "ltr"}
        style={themeStyle}
        className="font-body relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#421017] px-5 py-5 text-[#fff8ea] sm:px-6 sm:py-10"
      >
        <Background image={background} />
        <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
          <LanguageSwitch
            langs={enabledLangs}
            lang={lang}
            onChange={(nextLang) => updateView({ lang: nextLang }, "replace")}
            light
          />
          <div className="mt-5 flex size-32 items-center justify-center rounded-full border border-[#d5a95d]/70 bg-[#fff8ea] p-2 text-[#681a27] shadow-[0_20px_70px_rgba(25,4,8,.52)] sm:mt-10 sm:size-40">
            {logo ? (
              <Image
                src={logo}
                alt={menu.businessName}
                width={152}
                height={152}
                priority
                className="size-28 rounded-full object-contain sm:size-36"
                unoptimized={isManagedMediaUrl(logo)}
              />
            ) : (
              <span className="font-display text-4xl font-semibold">{businessInitials(menu.businessName)}</span>
            )}
          </div>
          {menu.businessType && (
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[.3em] text-[#e7c784] sm:mt-7 sm:tracking-[.34em]">
              {menu.businessType}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-.025em] sm:mt-3 sm:text-5xl">
            {menu.businessName}
          </h1>
          {menu.establishedYear && (
            <p className="mt-2 text-xs uppercase tracking-[.2em] text-[#e7c784]">
              {t.since} {menu.establishedYear}
            </p>
          )}
          {slogan && <p className="mt-3 max-w-sm text-sm leading-6 text-[#fff8ea]/76">{slogan}</p>}
          <button
            onClick={() => updateView({ entered: true })}
            className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full border border-[#f0d79f]/55 bg-[#d5a95d] px-7 text-sm font-bold text-[#3f1017] shadow-[0_12px_35px_rgba(33,6,11,.32)] transition hover:-translate-y-0.5 hover:bg-[#e2bd73] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fff8ea] motion-reduce:transform-none sm:mt-10"
          >
            {t.enter}
            <ChevronRight className={`size-4 ${rtl ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={rtl ? "rtl" : "ltr"} style={themeStyle} className="font-body min-h-dvh bg-[#f6efe2] text-[#2b2020]">
      <header className="relative overflow-hidden bg-[#681a27] px-4 pb-12 pt-4 text-[#fff8ea] sm:pb-16">
        <Background image={background} subtle />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="flex flex-col gap-3 min-[361px]:flex-row min-[361px]:items-start min-[361px]:justify-between">
            <button
              onClick={() => categoryId && closeOneLevel({ categoryId: null, itemId: null })}
              className="flex min-w-0 items-center gap-2.5 text-start"
              aria-label={t.categories}
            >
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#fff8ea] p-1 text-[#681a27] shadow-lg">
                {logo ? (
                  <Image
                    src={logo}
                    alt=""
                    width={60}
                    height={60}
                    className="size-14 rounded-full object-contain"
                    unoptimized={isManagedMediaUrl(logo)}
                  />
                ) : (
                  <span className="font-display text-lg font-semibold">{businessInitials(menu.businessName)}</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-xl font-semibold leading-tight sm:text-2xl">{menu.businessName}</span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-[.24em] text-[#e7c784]">{t.menu}</span>
              </span>
            </button>
            <LanguageSwitch
              langs={enabledLangs}
              lang={lang}
              onChange={(nextLang) => updateView({ lang: nextLang }, "replace")}
              light
            />
          </div>
          <div className="mt-12 max-w-xl sm:mt-16">
            <p className="text-xs font-semibold uppercase tracking-[.26em] text-[#e7c784]">
              {category ? t.menu : t.categories}
            </p>
            <h1
              ref={contentHeadingRef}
              tabIndex={-1}
              className="mt-2 font-display text-4xl font-semibold leading-tight outline-none sm:text-5xl"
            >
              {category ? pick(category, "name", lang) : slogan || menu.businessName}
            </h1>
            {category && lang !== "tr" && pick(category, "name", lang) !== category.name && (
              <p className="mt-2 text-sm text-[#fff8ea]/68">{category.name}</p>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-5 max-w-5xl px-4 pb-16">
        {category ? (
          <CategoryView
            category={category}
            lang={lang}
            currencyCode={menu.currencyCode}
            onBack={() => closeOneLevel({ categoryId: null, itemId: null })}
            onItem={(item) => updateView({ itemId: item.id })}
          />
        ) : (
          <CategoryGrid
            categories={categories}
            lang={lang}
            onSelect={(nextCategoryId) => updateView({
              categoryId: nextCategoryId,
              itemId: null,
            })}
          />
        )}
      </main>

      <RestaurantFooter menu={menu} lang={lang} variant="inci" />
      <ItemDetails
        item={selectedItem}
        lang={lang}
        menu={menu}
        onClose={() => closeOneLevel({ itemId: null })}
      />
    </div>
  );
}

function Background({ image, subtle = false }: { image: string; subtle?: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(image)})` }} />
      <div className={`absolute inset-0 ${subtle ? "bg-[#4d111b]/80" : "bg-[linear-gradient(180deg,rgba(48,8,14,.34),rgba(48,8,14,.77))]"}`} />
    </>
  );
}

function LanguageSwitch({
  langs,
  lang,
  onChange,
  light = false,
}: {
  langs: Lang[];
  lang: Lang;
  onChange: (lang: Lang) => void;
  light?: boolean;
}) {
  if (langs.length < 2) return null;
  return (
    <div className={`flex self-start rounded-full border p-1 backdrop-blur min-[361px]:self-auto ${light ? "border-white/20 bg-black/20" : "border-[#882634]/15 bg-white"}`}>
      {langs.map((entry) => (
        <button
          key={entry}
          onClick={() => onChange(entry)}
          className={`min-h-11 min-w-10 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
            lang === entry
              ? "bg-[#d5a95d] text-[#3c1017]"
              : light ? "text-white/75 hover:text-white" : "text-[#882634]/60 hover:text-[#882634]"
          }`}
        >
          {LANG_LABELS[entry]}
        </button>
      ))}
    </div>
  );
}

function CategoryGrid({
  categories,
  lang,
  onSelect,
}: {
  categories: MenuData["categories"];
  lang: Lang;
  onSelect: (id: string) => void;
}) {
  if (categories.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[#882634]/10 bg-[#fffaf0] px-6 py-14 text-center shadow-[0_18px_50px_-35px_rgba(69,13,22,.7)]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#882634] text-[#d5a95d]">
          <Clock3 className="size-5" />
        </span>
        <p className="mx-auto mt-5 max-w-sm font-display text-2xl font-semibold text-[#4e1720]">
          {COPY[lang].emptyMenu}
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-5">
      {categories.map((category, index) => {
        const image = category.imageUrl || category.items.find((item) => item.imageUrl)?.imageUrl;
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className="group relative min-h-48 overflow-hidden rounded-[1.4rem] bg-[#681a27] text-start shadow-[0_18px_50px_-30px_rgba(69,13,22,.8)] transition hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(69,13,22,.9)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#882634] motion-reduce:transform-none sm:min-h-72"
          >
            {image ? (
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
                unoptimized={isManagedMediaUrl(image)}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length] }}>
                <span className="absolute end-4 top-3 font-display text-6xl font-semibold text-[#fff4d9]/8 sm:text-7xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute -bottom-12 -start-12 size-36 rounded-full border border-[#d5a95d]/15 sm:size-44" />
                <span className="absolute -bottom-6 -start-6 size-24 rounded-full border border-[#d5a95d]/15 sm:size-32" />
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(34,5,10,.88)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-[#fff8ea] sm:p-5">
              <div className="mb-3 h-px w-9 bg-[#d5a95d]" />
              <h2 className="break-words font-display text-[1.35rem] font-semibold leading-tight [overflow-wrap:anywhere] sm:text-2xl">{pick(category, "name", lang)}</h2>
              {lang !== "tr" && pick(category, "name", lang) !== category.name && (
                <p className="mt-1 text-xs text-white/60">{category.name}</p>
              )}
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#e7c784]">
                {category.items.length} {COPY[lang].products}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CategoryView({
  category,
  lang,
  currencyCode,
  onBack,
  onItem,
}: {
  category: MenuData["categories"][number];
  lang: Lang;
  currencyCode: string;
  onBack: () => void;
  onItem: (item: MenuItem) => void;
}) {
  const t = COPY[lang];
  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#882634] shadow-sm transition hover:bg-[#fffaf0]">
        <ArrowLeft className={`size-4 ${isRtl(lang) ? "rotate-180" : ""}`} />
        {t.back}
      </button>
      {category.items.length === 0 ? (
        <p className="rounded-3xl bg-white p-8 text-center text-[#6e5b58] shadow-sm">{t.empty}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {category.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItem(item)}
              className="group flex min-h-32 overflow-hidden rounded-[1.25rem] border border-[#882634]/10 bg-[#fffaf0] text-start shadow-[0_12px_35px_-30px_rgba(69,13,22,.65)] transition hover:border-[#d5a95d]/70 hover:shadow-[0_18px_40px_-28px_rgba(69,13,22,.8)] disabled:opacity-55"
              disabled={!item.isAvailable}
            >
              {item.imageUrl ? (
                <div className="relative w-32 shrink-0 overflow-hidden sm:w-36">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="144px"
                    className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                    unoptimized={isManagedMediaUrl(item.imageUrl)}
                  />
                </div>
              ) : (
                <div className="relative flex w-24 shrink-0 items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#932d3e,#641722)] text-[#e3bd73]">
                  <span className="absolute size-16 rounded-full border border-[#e3bd73]/20" />
                  <span className="font-display text-3xl font-semibold">{pick(item, "name", lang).trim().charAt(0)}</span>
                </div>
              )}
              <span className="flex min-w-0 flex-1 flex-col p-4">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-display text-lg font-semibold leading-tight text-[#4e1720]">{pick(item, "name", lang)}</span>
                  <span className="shrink-0 text-sm font-bold text-[#882634]">{formatPrice(item.price, currencyCode, lang)}</span>
                </span>
                {lang !== "tr" && pick(item, "name", lang) !== item.name && (
                  <span className="mt-1 text-xs text-[#806d69]">{item.name}</span>
                )}
                {pick(item, "description", lang) && (
                  <span className="mt-2 line-clamp-2 text-xs leading-5 text-[#77635f]">{pick(item, "description", lang)}</span>
                )}
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {item.isNew && <StatusBadge>{t.new}</StatusBadge>}
                  {item.isFeatured && <StatusBadge>{t.featured}</StatusBadge>}
                  {!item.isAvailable && <StatusBadge>{t.unavailable}</StatusBadge>}
                </span>
                {item.isAvailable && (
                  <span className="mt-auto pt-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#b18439]">{t.details}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemDetails({
  item,
  lang,
  menu,
  onClose,
}: {
  item: MenuItem | null;
  lang: Lang;
  menu: MenuData;
  onClose: () => void;
}) {
  const t = COPY[lang];
  const nutrition = item?.nutrition;
  const nutritionValues = useMemo(() => nutrition ? [
    ["kcal", nutrition.energyKcal],
    ["protein", nutrition.protein],
    ["fat", nutrition.fat],
    ["saturated", nutrition.saturatedFat],
    ["carbs", nutrition.carbohydrate],
    ["sugar", nutrition.sugar],
    ["fiber", nutrition.fiber],
    ["salt", nutrition.saltG],
  ].filter((entry) => entry[1] != null) : [], [nutrition]);
  const allergenNotice = pick(menu, "allergenNotice", lang);
  const nutritionNotice = pick(menu, "nutritionNotice", lang);

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bottom-0 left-0 top-auto max-h-[92dvh] max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-b-none rounded-t-[1.75rem] border-[#d5a95d]/35 bg-[#fffaf0] p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
        {item && (
          <>
            {item.imageUrl && (
              <div className="relative h-60 w-full overflow-hidden rounded-t-lg sm:h-72">
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  sizes="576px"
                  className="object-cover"
                  unoptimized={isManagedMediaUrl(item.imageUrl)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3d0c14]/55 to-transparent" />
              </div>
            )}
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-5 pe-8">
                <div>
                  <DialogTitle className="font-display text-3xl font-semibold leading-tight text-[#4e1720]">{pick(item, "name", lang)}</DialogTitle>
                  {lang !== "tr" && pick(item, "name", lang) !== item.name && <p className="mt-1 text-sm text-[#806d69]">{item.name}</p>}
                </div>
                <p className="shrink-0 text-xl font-bold text-[#882634]">{formatPrice(item.price, menu.currencyCode, lang)}</p>
              </div>
              {pick(item, "description", lang) && <p className="mt-4 leading-7 text-[#65514e]">{pick(item, "description", lang)}</p>}
              {item.portionGrams && <DetailLine label={t.portion} value={`${item.portionGrams} g`} />}
              {item.ingredients && <DetailLine label={t.ingredients} value={item.ingredients} />}
              {item.allergens.length > 0 && (
                <section className="mt-6 border-t border-[#882634]/12 pt-5">
                  <h3 className="text-xs font-bold uppercase tracking-[.18em] text-[#882634]">{t.allergens}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.allergens.map(({ allergen }) => (
                      <span key={allergen.id} className="rounded-full bg-[#882634]/8 px-3 py-1.5 text-xs text-[#5d2930]">
                        {allergen.icon} {lang === "tr" ? allergen.nameTr : lang === "en" ? allergen.nameEn : lang === "ar" ? allergen.nameAr : allergen.nameRu || allergen.nameTr}
                      </span>
                    ))}
                  </div>
                  {allergenNotice && <p className="mt-3 text-xs leading-5 text-[#806d69]">{allergenNotice}</p>}
                </section>
              )}
              {nutrition && nutritionValues.length > 0 && (
                <section className="mt-6 border-t border-[#882634]/12 pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-[.18em] text-[#882634]">{t.nutrition}</h3>
                    <span className="text-xs text-[#806d69]">
                      {NUTRITION_BASIS[lang][nutrition.basis || "per portion"] || nutrition.basis}
                      {nutrition.isEstimated ? ` · ${t.estimated}` : ""}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {nutritionValues.map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl bg-[#882634]/6 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-[#806d69]">
                          {label === "kcal" ? "kcal" : NUTRITION_LABELS[lang][String(label)]}
                        </p>
                        <p className="mt-1 font-semibold text-[#4e1720]">{String(value)}{label === "kcal" ? "" : " g"}</p>
                      </div>
                    ))}
                  </div>
                  {nutritionNotice && <p className="mt-3 text-xs leading-5 text-[#806d69]">{nutritionNotice}</p>}
                </section>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex gap-3 text-sm">
      <span className="w-24 shrink-0 font-semibold text-[#882634]">{label}</span>
      <span className="text-[#65514e]">{value}</span>
    </div>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#882634]/8 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#882634]">
      {children}
    </span>
  );
}

function businessInitials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}
