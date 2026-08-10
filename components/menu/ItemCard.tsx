import Image from "next/image";
import type { CSSProperties } from "react";
import type { MenuItem } from "@/lib/menu";
import { isManagedMediaUrl } from "@/lib/media-url";
import { type Lang, UI, pick, formatPrice } from "@/lib/i18n";

const softAccent = "color-mix(in oklab, var(--menu-accent) 14%, transparent)";

export function ItemCard({
  item,
  lang,
  currencyCode,
}: {
  item: MenuItem;
  lang: Lang;
  currencyCode: string;
}) {
  const t = UI[lang];
  const name = pick(item, "name", lang);
  const description = pick(item, "description", lang);
  const sold = !item.isAvailable;
  const featured = item.isFeatured;

  const cardStyle: CSSProperties = {
    background: "var(--menu-surface)",
    borderRadius: "var(--menu-radius-card)",
    border: featured
      ? "1px solid color-mix(in oklab, var(--menu-accent) 55%, var(--menu-border))"
      : "1px solid var(--menu-border)",
    boxShadow: "var(--menu-shadow)",
    opacity: sold ? 0.6 : 1,
  };

  return (
    <article className="relative flex gap-3.5 overflow-hidden p-3.5" style={cardStyle}>
      {item.imageUrl && (
        <div
          className="relative h-24 w-24 shrink-0 overflow-hidden"
          style={{ borderRadius: "calc(var(--menu-radius-card) - 6px)" }}
        >
          <Image
            src={item.imageUrl}
            alt={name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized={isManagedMediaUrl(item.imageUrl)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              className="font-display text-[18px] font-semibold leading-tight tracking-[-0.01em]"
              style={{ color: "var(--menu-text)" }}
            >
              {name}
            </h3>
            {item.isNew && <Pill label={t.new} solid />}
            {featured && <Pill label={t.featured} />}
          </div>
          <span
            className="shrink-0 whitespace-nowrap font-display text-[16px] font-semibold"
            style={{ color: "var(--menu-accent)" }}
          >
            {formatPrice(item.price, currencyCode, lang)}
          </span>
        </div>

        {description && (
          <p
            className="mt-1 line-clamp-2 text-[13.5px] leading-snug"
            style={{ color: "var(--menu-text-muted)" }}
          >
            {description}
          </p>
        )}

        {(item.allergens.length > 0 || sold) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {sold && (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: "var(--menu-surface-alt)", color: "var(--menu-text-muted)" }}
              >
                {t.unavailable}
              </span>
            )}
            {item.allergens.map((a) => (
              <span
                key={a.allergenId}
                className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px]"
                style={{
                  background: "var(--menu-surface-alt)",
                  color: "var(--menu-text-muted)",
                  border: "1px solid var(--menu-border)",
                }}
                title={
                  lang === "en" ? a.allergen.nameEn : lang === "ar" ? a.allergen.nameAr : lang === "ru" ? a.allergen.nameRu || a.allergen.nameTr : a.allergen.nameTr
                }
              >
                <span aria-hidden>{a.allergen.icon}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Pill({ label, solid }: { label: string; solid?: boolean }) {
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={
        solid
          ? { background: "var(--menu-accent)", color: "var(--menu-accent-text)" }
          : { background: softAccent, color: "var(--menu-accent)" }
      }
    >
      {label}
    </span>
  );
}
