"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MenuData } from "@/lib/menu";
import { type Lang, LANG_LABELS, UI, isRtl, pick } from "@/lib/i18n";
import { type ThemeTokens, themeToCssVars } from "@/lib/themes";
import { ItemCard } from "./ItemCard";
import { RestaurantFooter } from "./RestaurantFooter";
import { ProgressiveImage } from "./ProgressiveImage";

interface Props {
  menu: MenuData;
  theme: ThemeTokens;
  enabledLangs: Lang[];
  defaultLang: Lang;
}

export function MenuView({ menu, theme, enabledLangs, defaultLang }: Props) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const style = useMemo(() => themeToCssVars(theme), [theme]);
  const rtl = isRtl(lang);
  const t = UI[lang];

  const nonEmpty = menu.categories.filter((c) => c.items.length > 0);
  const hasMenu = nonEmpty.length > 0;
  const accordion = menu.categoryNavigationStyle === "ACCORDION";

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      style={style}
      className="menu-scroll min-h-full bg-[var(--menu-background)] font-body text-[var(--menu-text)]"
    >
      <div>
        <Hero menu={menu} lang={lang} enabledLangs={enabledLangs} onLang={setLang} />

        {hasMenu && !accordion && (
          <DrilldownNav categories={nonEmpty} lang={lang} />
        )}

        <main className="mx-auto max-w-2xl px-4 pb-20 pt-7">
          {!hasMenu && (
            <div className="flex min-h-[30vh] items-center justify-center text-center">
              <p className="font-display text-xl text-[var(--menu-text-muted)]">
                {t.emptyMenu}
              </p>
            </div>
          )}

          {accordion
            ? nonEmpty.map((c, index) => (
                <AccordionSection key={c.id} category={c} lang={lang} currencyCode={menu.currencyCode} eagerImages={index === 0} />
              ))
            : nonEmpty.map((c, index) => (
                <StackedSection key={c.id} category={c} lang={lang} currencyCode={menu.currencyCode} eagerImages={index === 0} />
              ))}
        </main>

        <RestaurantFooter menu={menu} lang={lang} />
      </div>
    </div>
  );
}

/* ----------------------------- Hero ----------------------------- */
function Hero({
  menu,
  lang,
  enabledLangs,
  onLang,
}: {
  menu: MenuData;
  lang: Lang;
  enabledLangs: Lang[];
  onLang: (l: Lang) => void;
}) {
  const slogan = pick(menu, "slogan", lang);
  return (
    <header
      className="relative flex w-full items-end overflow-hidden bg-[var(--menu-primary)]"
      style={{ height: "var(--menu-hero-height)" }}
    >
      {menu.coverImage ? (
        <ProgressiveImage
          src={menu.coverImage}
          alt=""
          fill
          preload
          quality={60}
          sizes="100vw"
          placeholderClassName="bg-[var(--menu-primary)]"
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, var(--menu-secondary) 0%, var(--menu-primary) 55%, var(--menu-background) 130%)",
          }}
        />
      )}
      <div className="absolute inset-0" style={{ background: "var(--menu-hero-scrim)" }} />

      {enabledLangs.length > 1 && (
        <div className="absolute top-4 end-4 z-10 flex gap-0.5 rounded-full border border-white/20 bg-black/30 p-1 backdrop-blur-md">
          {enabledLangs.map((l) => (
            <button
              key={l}
              onClick={() => onLang(l)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                l === lang ? "bg-white text-black" : "text-white/85 hover:text-white"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      )}

      <div className="relative z-10 w-full px-5 pb-7">
        {menu.logo && (
          <div className="mb-3.5 h-[72px] w-[72px] overflow-hidden rounded-full bg-white/15 shadow-lg ring-2 ring-white/85">
            <ProgressiveImage
              src={menu.logo}
              alt={menu.businessName}
              width={72}
              height={72}
              loading="eager"
              placeholderClassName="bg-white/15"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div
          className="mb-2 h-0.5 w-9 rounded-full"
          style={{ background: "var(--menu-accent)" }}
        />
        <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] text-white drop-shadow-sm">
          {menu.businessName}
        </h1>
        {(slogan || menu.businessType) && (
          <p className="mt-1.5 max-w-md text-sm text-white/85">
            {slogan || menu.businessType}
          </p>
        )}
      </div>
    </header>
  );
}

/* ------------------------- Drilldown nav ------------------------- */
function DrilldownNav({
  categories,
  lang,
}: {
  categories: MenuData["categories"];
  lang: Lang;
}) {
  const [active, setActive] = useState<string | null>(categories[0]?.id ?? null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id.replace("cat-", ""));
      },
      { rootMargin: "-42% 0px -52% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [categories]);

  return (
    <nav className="sticky top-0 z-20 border-b border-[var(--menu-border)] bg-[color-mix(in_oklab,var(--menu-surface-alt)_92%,transparent)] backdrop-blur">
      <div className="no-scrollbar mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-3">
        {categories.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              onClick={() =>
                document.getElementById(`cat-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition"
              style={
                on
                  ? { background: "var(--menu-accent)", color: "var(--menu-accent-text)" }
                  : {
                      background: "var(--menu-surface)",
                      color: "var(--menu-text-muted)",
                      border: "1px solid var(--menu-border)",
                    }
              }
            >
              {pick(c, "name", lang)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* --------------------------- Sections --------------------------- */
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--menu-primary)]">
        {title}
      </h2>
      <span className="h-px flex-1" style={{ background: "var(--menu-border)" }} />
    </div>
  );
}

function StackedSection({
  category,
  lang,
  currencyCode,
  eagerImages,
}: {
  category: MenuData["categories"][number];
  lang: Lang;
  currencyCode: string;
  eagerImages: boolean;
}) {
  return (
    <section id={`cat-${category.id}`} className="scroll-mt-16 pt-7 first:pt-1">
      <SectionHeading title={pick(category, "name", lang)} />
      <div className="flex flex-col gap-3">
        {category.items.map((item, index) => (
          <ItemCard key={item.id} item={item} lang={lang} currencyCode={currencyCode} eager={eagerImages && index < 4} />
        ))}
      </div>
    </section>
  );
}

function AccordionSection({
  category,
  lang,
  currencyCode,
  eagerImages,
}: {
  category: MenuData["categories"][number];
  lang: Lang;
  currencyCode: string;
  eagerImages: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="border-b border-[var(--menu-border)] py-4 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3"
      >
        <span className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--menu-primary)]">
          {pick(category, "name", lang)}
        </span>
        <span className="flex items-center gap-2 text-[var(--menu-text-muted)]">
          <span className="text-sm">{category.items.length}</span>
          <ChevronDown
            className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {category.items.map((item, index) => (
            <ItemCard key={item.id} item={item} lang={lang} currencyCode={currencyCode} eager={eagerImages && index < 4} />
          ))}
        </div>
      )}
    </section>
  );
}
