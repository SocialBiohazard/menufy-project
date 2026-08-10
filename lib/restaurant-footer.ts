import type { Lang } from "@/lib/i18n";

export const FOOTER_FIELD_KEYS = [
  "description",
  "phone",
  "whatsapp",
  "email",
  "website",
  "address",
  "maps",
  "hours",
  "reviews",
  "instagram",
  "facebook",
  "tiktok",
  "x",
  "youtube",
  "copyright",
] as const;

export type FooterFieldKey = (typeof FOOTER_FIELD_KEYS)[number];
export type FooterVisibility = Record<FooterFieldKey, boolean>;

export const DEFAULT_FOOTER_VISIBILITY = Object.fromEntries(
  FOOTER_FIELD_KEYS.map((key) => [key, true]),
) as FooterVisibility;

export function normalizeFooterVisibility(value: unknown): FooterVisibility {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return Object.fromEntries(
    FOOTER_FIELD_KEYS.map((key) => [key, source[key] !== false]),
  ) as FooterVisibility;
}

export interface HoursPeriod {
  start: string;
  end: string;
}

export interface DayHours {
  day: number;
  closed: boolean;
  allDay: boolean;
  periods: HoursPeriod[];
}

export interface WeeklyHours {
  timezone: string;
  schedule: DayHours[];
}

export const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0] as const;

export function emptyWeeklyHours(timezone = "Europe/Istanbul"): WeeklyHours {
  return {
    timezone,
    schedule: WEEK_DAYS.map((day) => ({
      day,
      closed: true,
      allDay: false,
      periods: [{ start: "09:00", end: "22:00" }],
    })),
  };
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function normalizeWeeklyHours(value: unknown, fallbackTimezone = "Europe/Istanbul"): WeeklyHours {
  const empty = emptyWeeklyHours(fallbackTimezone);
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
  const source = value as Record<string, unknown>;
  const timezone = typeof source.timezone === "string" && source.timezone
    ? source.timezone
    : fallbackTimezone;
  if (!Array.isArray(source.schedule)) return { ...empty, timezone };

  const byDay = new Map<number, DayHours>();
  for (const entry of source.schedule) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const row = entry as Record<string, unknown>;
    const day = typeof row.day === "number" ? row.day : -1;
    if (!WEEK_DAYS.includes(day as (typeof WEEK_DAYS)[number])) continue;
    const periods = Array.isArray(row.periods)
      ? row.periods.flatMap((period) => {
          if (!period || typeof period !== "object" || Array.isArray(period)) return [];
          const item = period as Record<string, unknown>;
          return typeof item.start === "string" && TIME_PATTERN.test(item.start) &&
            typeof item.end === "string" && TIME_PATTERN.test(item.end)
            ? [{ start: item.start, end: item.end }]
            : [];
        })
      : [];
    byDay.set(day, {
      day,
      closed: row.closed !== false,
      allDay: row.allDay === true,
      periods: periods.length ? periods : [{ start: "09:00", end: "22:00" }],
    });
  }

  return {
    timezone,
    schedule: WEEK_DAYS.map((day) => byDay.get(day) ?? empty.schedule.find((row) => row.day === day)!),
  };
}

export function hasConfiguredHours(hours: WeeklyHours): boolean {
  return hours.schedule.some((day) => !day.closed);
}

export function localizedLegacyHours(value: unknown, lang: Lang): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  const localized = lang === "en"
    ? record.displayEn
    : lang === "ar"
      ? record.displayAr
      : lang === "ru"
        ? record.displayRu
        : record.display;
  const display = localized || record.display;
  return typeof display === "string" ? display : "";
}

export function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function minutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function dayAndMinutes(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return { day, value: hour * 60 + minute };
}

export function isRestaurantOpen(hours: WeeklyHours, now = new Date()): boolean {
  if (!hasConfiguredHours(hours) || !isValidTimezone(hours.timezone)) return false;
  const current = dayAndMinutes(now, hours.timezone);
  const today = hours.schedule.find((entry) => entry.day === current.day);
  if (today && !today.closed) {
    if (today.allDay) return true;
    if (today.periods.some((period) => {
      const start = minutes(period.start);
      const end = minutes(period.end);
      return end > start
        ? current.value >= start && current.value < end
        : current.value >= start;
    })) return true;
  }
  const yesterdayDay = (current.day + 6) % 7;
  const yesterday = hours.schedule.find((entry) => entry.day === yesterdayDay);
  return Boolean(yesterday && !yesterday.closed && !yesterday.allDay && yesterday.periods.some((period) => {
    const start = minutes(period.start);
    const end = minutes(period.end);
    return end <= start && current.value < end;
  }));
}

export function generatedMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function defaultCopyright(businessName: string, year = new Date().getFullYear()): string {
  return `© ${year} ${businessName}.`;
}

export function callablePhone(value: string): string {
  return value.replace(/[^+\d]/g, "");
}

export function whatsappUrl(value: string): string {
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}
