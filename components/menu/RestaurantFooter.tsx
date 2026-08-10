"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AtSign,
  Camera,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Play,
  Star,
  Users,
} from "lucide-react";
import type { MenuData } from "@/lib/menu";
import { pick, type Lang } from "@/lib/i18n";
import { isManagedMediaUrl } from "@/lib/media-url";
import {
  callablePhone,
  defaultCopyright,
  generatedMapsUrl,
  hasConfiguredHours,
  isRestaurantOpen,
  localizedLegacyHours,
  normalizeFooterVisibility,
  normalizeWeeklyHours,
  whatsappUrl,
  type DayHours,
} from "@/lib/restaurant-footer";

const COPY = {
  tr: {
    contact: "İletişim",
    visit: "Bizi ziyaret edin",
    hours: "Çalışma saatleri",
    follow: "Bizi takip edin",
    directions: "Yol tarifi",
    reviews: "Yorumlar",
    open: "Şu anda açık",
    closed: "Şu anda kapalı",
    allDay: "24 saat açık",
    closedDay: "Kapalı",
  },
  en: {
    contact: "Contact",
    visit: "Visit us",
    hours: "Opening hours",
    follow: "Follow us",
    directions: "Directions",
    reviews: "Reviews",
    open: "Open now",
    closed: "Closed now",
    allDay: "Open 24 hours",
    closedDay: "Closed",
  },
  ar: {
    contact: "التواصل",
    visit: "زورونا",
    hours: "ساعات العمل",
    follow: "تابعونا",
    directions: "الاتجاهات",
    reviews: "التقييمات",
    open: "مفتوح الآن",
    closed: "مغلق الآن",
    allDay: "مفتوح 24 ساعة",
    closedDay: "مغلق",
  },
  ru: {
    contact: "Контакты",
    visit: "Как нас найти",
    hours: "Часы работы",
    follow: "Мы в соцсетях",
    directions: "Маршрут",
    reviews: "Отзывы",
    open: "Сейчас открыто",
    closed: "Сейчас закрыто",
    allDay: "Круглосуточно",
    closedDay: "Закрыто",
  },
} satisfies Record<Lang, Record<string, string>>;

const DAY_NAMES: Record<Lang, string[]> = {
  tr: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
};

type FooterVariant = "default" | "inci";

export function RestaurantFooter({
  menu,
  lang,
  variant = "default",
}: {
  menu: MenuData;
  lang: Lang;
  variant?: FooterVariant;
}) {
  const t = COPY[lang];
  const visibility = useMemo(() => normalizeFooterVisibility(menu.footerVisibility), [menu.footerVisibility]);
  const address = [menu.address, menu.district, menu.city].filter(Boolean).join(", ");
  const description = visibility.description ? pick(menu, "footerDescription", lang) : "";
  const hours = useMemo(() => normalizeWeeklyHours(menu.workingHours, menu.timezone), [menu.workingHours, menu.timezone]);
  const hasSchedule = visibility.hours && hasConfiguredHours(hours);
  const legacyHours = visibility.hours ? localizedLegacyHours(menu.workingHours, lang) : "";
  const [openNow, setOpenNow] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpenNow(hasSchedule ? isRestaurantOpen(hours) : null);
    const initial = window.setTimeout(update, 0);
    const interval = hasSchedule ? window.setInterval(update, 60_000) : undefined;
    return () => {
      window.clearTimeout(initial);
      if (interval) window.clearInterval(interval);
    };
  }, [hasSchedule, hours]);

  const whatsappNumber = menu.whatsappNumber || menu.phone || "";
  const mapsUrl = menu.googleMapsUrl || (address ? generatedMapsUrl(address) : "");
  const contactLinks = [
    visibility.phone && menu.phone && { href: `tel:${callablePhone(menu.phone)}`, label: menu.phone, icon: Phone },
    visibility.whatsapp && whatsappNumber && { href: whatsappUrl(whatsappNumber), label: whatsappNumber, icon: MessageCircle },
    visibility.email && menu.email && { href: `mailto:${menu.email}`, label: menu.email, icon: Mail },
    visibility.website && menu.websiteUrl && { href: menu.websiteUrl, label: readableUrl(menu.websiteUrl), icon: Globe2 },
  ].filter(Boolean) as FooterLink[];
  const visitLinks = [
    visibility.maps && mapsUrl && { href: mapsUrl, label: t.directions, icon: MapPin },
    visibility.reviews && menu.googleReviewsUrl && { href: menu.googleReviewsUrl, label: t.reviews, icon: Star },
  ].filter(Boolean) as FooterLink[];
  const socialLinks = [
    visibility.instagram && menu.instagramUrl && { href: menu.instagramUrl, label: "Instagram", icon: Camera },
    visibility.facebook && menu.facebookUrl && { href: menu.facebookUrl, label: "Facebook", icon: Users },
    visibility.tiktok && menu.tiktokUrl && { href: menu.tiktokUrl, label: "TikTok", icon: Music2 },
    visibility.x && menu.xUrl && { href: menu.xUrl, label: "X", icon: AtSign },
    visibility.youtube && menu.youtubeUrl && { href: menu.youtubeUrl, label: "YouTube", icon: Play },
  ].filter(Boolean) as FooterLink[];
  const showAddress = visibility.address && Boolean(address);
  const copyright = visibility.copyright
    ? menu.footerCopyright || defaultCopyright(menu.businessName)
    : "";
  const taxNotice = pick(menu, "kdvNotice", lang);
  const hasContent = description || contactLinks.length || visitLinks.length || socialLinks.length ||
    showAddress || hasSchedule || legacyHours || taxNotice || copyright;

  if (!hasContent) return null;

  const isInci = variant === "inci";
  return (
    <footer className={isInci
      ? "bg-[#55131e] px-4 py-12 text-[#fff8ea]"
      : "border-t border-[var(--menu-border)] bg-[var(--menu-surface-alt)] px-4 py-10 text-[var(--menu-text)]"
    }>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-9 md:grid-cols-2 md:gap-14">
          <div className="flex flex-col gap-7">
            <div>
              <div className="flex items-center gap-3">
                {menu.logo && (
                  <Image
                    src={menu.logo}
                    alt=""
                    width={56}
                    height={56}
                    className={isInci ? "size-14 rounded-full border border-[#e7c784]/40 object-cover" : "size-14 rounded-full object-cover"}
                    unoptimized={isManagedMediaUrl(menu.logo)}
                  />
                )}
                <p className={isInci ? "font-display text-2xl font-semibold" : "font-display text-xl font-semibold text-[var(--menu-primary)]"}>
                  {menu.businessName}
                </p>
              </div>
              {description && (
                <p className={isInci ? "mt-4 max-w-xl text-sm leading-6 text-[#fff8ea]/70" : "mt-4 max-w-xl text-sm leading-6 text-[var(--menu-text-muted)]"}>
                  {description}
                </p>
              )}
            </div>

            {(showAddress || visitLinks.length > 0) && (
              <FooterSection title={t.visit} inci={isInci}>
                {showAddress && <p className="text-sm leading-6 opacity-75">{address}</p>}
                <FooterLinks links={visitLinks} inci={isInci} />
              </FooterSection>
            )}

            {contactLinks.length > 0 && (
              <FooterSection title={t.contact} inci={isInci}>
                <FooterLinks links={contactLinks} inci={isInci} stacked />
              </FooterSection>
            )}
          </div>

          <div className="flex flex-col gap-7">
            {(hasSchedule || legacyHours) && (
              <FooterSection title={t.hours} inci={isInci}>
                {hasSchedule ? (
                  <>
                    {openNow !== null && (
                      <p className={`mb-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        openNow
                          ? isInci ? "bg-emerald-400/15 text-emerald-200" : "bg-emerald-500/10 text-emerald-700"
                          : isInci ? "bg-white/10 text-white/65" : "bg-black/5 text-[var(--menu-text-muted)]"
                      }`}>
                        <Clock3 className="size-3.5" />
                        {openNow ? t.open : t.closed}
                      </p>
                    )}
                    <HoursTable schedule={hours.schedule} lang={lang} inci={isInci} />
                  </>
                ) : (
                  <p className="text-sm leading-6 opacity-75">{legacyHours}</p>
                )}
              </FooterSection>
            )}

            {socialLinks.length > 0 && (
              <FooterSection title={t.follow} inci={isInci}>
                <FooterLinks links={socialLinks} inci={isInci} />
              </FooterSection>
            )}
          </div>
        </div>

        {(taxNotice || copyright) && (
          <div className={isInci
            ? "mt-10 border-t border-white/10 pt-5 text-xs text-white/45"
            : "mt-10 border-t border-[var(--menu-border)] pt-5 text-xs text-[var(--menu-text-muted)]"
          }>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {taxNotice && <p>{taxNotice}</p>}
              {copyright && <p>{copyright}</p>}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}

interface FooterLink {
  href: string;
  label: string;
  icon: typeof Phone;
}

function FooterSection({ title, inci, children }: { title: string; inci: boolean; children: React.ReactNode }) {
  return (
    <section>
      <h2 className={inci
        ? "mb-3 text-xs font-semibold uppercase tracking-[.16em] text-[#e7c784]"
        : "mb-3 text-xs font-semibold uppercase tracking-[.14em] text-[var(--menu-primary)]"
      }>{title}</h2>
      {children}
    </section>
  );
}

function FooterLinks({ links, inci, stacked = false }: { links: FooterLink[]; inci: boolean; stacked?: boolean }) {
  return (
    <div className={stacked ? "flex flex-col items-start gap-2" : "flex flex-wrap gap-2"}>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={`${label}-${href}`}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={inci
            ? "inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold transition hover:border-[#d5a95d] hover:text-[#e7c784]"
            : "inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--menu-border)] px-3.5 py-2 text-xs font-semibold text-[var(--menu-primary)] transition hover:bg-[var(--menu-surface)]"
          }
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </a>
      ))}
    </div>
  );
}

function HoursTable({ schedule, lang, inci }: { schedule: DayHours[]; lang: Lang; inci: boolean }) {
  const t = COPY[lang];
  return (
    <div className="grid gap-1.5 text-sm">
      {schedule.map((day) => (
        <div key={day.day} className="grid grid-cols-[minmax(7rem,1fr)_auto] gap-4">
          <span className={inci ? "text-[#fff8ea]/65" : "text-[var(--menu-text-muted)]"}>{DAY_NAMES[lang][day.day]}</span>
          <span className="text-end font-medium">
            {day.closed
              ? t.closedDay
              : day.allDay
                ? t.allDay
                : day.periods.map((period) => `${period.start}–${period.end}`).join(", ")}
          </span>
        </div>
      ))}
    </div>
  );
}

function readableUrl(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
