import type { CSSProperties } from "react";

/**
 * A theme is a pure token set. The menu template renders identically for every
 * theme; only these tokens change. To add a NEW theme, add one entry to
 * `THEMES` (and register its font in app/layout.tsx if new). No component edits.
 *
 * Per-restaurant palette overrides (Restaurant.theme* columns) merge on top, so
 * a restaurant keeps a theme's layout/feel while swapping its brand colors.
 */

export type ThemeMode = "light" | "dark";

export interface ThemeTokens {
  label: string;
  blurb: string; // one-line description for the picker
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string; // cards
    surfaceAlt: string; // nav bar, subtle sections
    text: string;
    textMuted: string;
    border: string;
    accent: string; // prices, active state, highlights
    accentText: string; // text/icon on accent
    primary: string; // hero wordmark / headings
    secondary: string; // supporting brand tone (gradient hero fallback)
    heroScrim: string;
  };
  fonts: { display: string; body: string };
  radiusCard: string;
  shadow: string;
  heroHeight: string;
}

export const DEFAULT_THEME_ID = "terracotta";

export const THEMES: Record<string, ThemeTokens> = {
  "inci-heritage": {
    label: "İnci Heritage",
    blurb: "Burgundy-and-gold heritage menu with category-first navigation.",
    mode: "light",
    colors: {
      background: "#F6EFE2",
      surface: "#FFFAF0",
      surfaceAlt: "#F0E3D1",
      text: "#2B2020",
      textMuted: "#806D69",
      border: "#E3CEAD",
      accent: "#D5A95D",
      accentText: "#3F1017",
      primary: "#882634",
      secondary: "#681A27",
      heroScrim: "linear-gradient(180deg, rgba(55,8,15,.2), rgba(55,8,15,.82))",
    },
    fonts: { display: "var(--font-playfair)", body: "var(--font-inter)" },
    radiusCard: "22px",
    shadow: "0 18px 50px -30px rgba(69,13,22,.8)",
    heroHeight: "52vh",
  },
  // Warm editorial classic — cream, terracotta, pine. Fraunces serif.
  terracotta: {
    label: "Terracotta",
    blurb: "Warm, editorial. Cream & terracotta with a serif headline.",
    mode: "light",
    colors: {
      background: "#FBF6EE",
      surface: "#FFFFFF",
      surfaceAlt: "#F2E9DA",
      text: "#241E17",
      textMuted: "#7C7061",
      border: "#E6D9C4",
      accent: "#B4521E",
      accentText: "#FFFFFF",
      primary: "#2E4034",
      secondary: "#9C6B3F",
      heroScrim: "linear-gradient(180deg, rgba(30,22,12,0) 28%, rgba(30,22,12,0.78) 100%)",
    },
    fonts: { display: "var(--font-fraunces)", body: "var(--font-inter)" },
    radiusCard: "18px",
    shadow: "0 8px 30px -14px rgba(60,40,20,0.28)",
    heroHeight: "48vh",
  },

  // Dark fine-dining — near black, warm gold, Playfair display serif.
  noir: {
    label: "Noir",
    blurb: "Dark & upscale. Near-black with warm gold and an elegant serif.",
    mode: "dark",
    colors: {
      background: "#0C0C0F",
      surface: "#17171C",
      surfaceAlt: "#121216",
      text: "#F5F1E8",
      textMuted: "#A69E8E",
      border: "#2A2A31",
      accent: "#C8A45B",
      accentText: "#14130E",
      primary: "#F5F1E8",
      secondary: "#8A6E3A",
      heroScrim: "linear-gradient(180deg, rgba(12,12,15,0) 20%, rgba(12,12,15,0.92) 100%)",
    },
    fonts: { display: "var(--font-playfair)", body: "var(--font-inter)" },
    radiusCard: "12px",
    shadow: "0 14px 44px -16px rgba(0,0,0,0.75)",
    heroHeight: "54vh",
  },

  // Fresh coastal — soft blue-greens, teal accent, DM Serif display.
  sahil: {
    label: "Sahil",
    blurb: "Light & fresh. Airy blue-greens with a teal accent. For cafés & seafood.",
    mode: "light",
    colors: {
      background: "#F4F8F9",
      surface: "#FFFFFF",
      surfaceAlt: "#E6F0F1",
      text: "#12262B",
      textMuted: "#5B7176",
      border: "#D2E3E5",
      accent: "#0E7C86",
      accentText: "#FFFFFF",
      primary: "#12262B",
      secondary: "#4A9AA3",
      heroScrim: "linear-gradient(180deg, rgba(10,30,34,0) 26%, rgba(10,30,34,0.74) 100%)",
    },
    fonts: { display: "var(--font-dm-serif)", body: "var(--font-inter)" },
    radiusCard: "20px",
    shadow: "0 12px 34px -16px rgba(14,80,90,0.22)",
    heroHeight: "46vh",
  },

  // Bold casual — charcoal, fiery orange, geometric Sora. For burgers/street food.
  ember: {
    label: "Ember",
    blurb: "Bold & punchy. Charcoal with fiery orange and a geometric type. For casual & street food.",
    mode: "dark",
    colors: {
      background: "#141210",
      surface: "#201C18",
      surfaceAlt: "#1A1613",
      text: "#F7F1EA",
      textMuted: "#B0A499",
      border: "#332B24",
      accent: "#E8541E",
      accentText: "#FFFFFF",
      primary: "#F7F1EA",
      secondary: "#B23A12",
      heroScrim: "linear-gradient(180deg, rgba(20,18,16,0) 22%, rgba(20,18,16,0.9) 100%)",
    },
    fonts: { display: "var(--font-sora)", body: "var(--font-inter)" },
    radiusCard: "16px",
    shadow: "0 14px 40px -16px rgba(0,0,0,0.6)",
    heroHeight: "50vh",
  },
};

export interface PaletteOverrides {
  themeAccent?: string | null;
  themePrimary?: string | null;
  themeSecondary?: string | null;
  themeBackground?: string | null;
  themeBorder?: string | null;
  themeText?: string | null;
}

export function resolveTheme(
  themeId: string | null | undefined,
  overrides: PaletteOverrides = {},
): ThemeTokens {
  const base = THEMES[themeId ?? DEFAULT_THEME_ID] ?? THEMES[DEFAULT_THEME_ID];
  return {
    ...base,
    colors: {
      ...base.colors,
      accent: overrides.themeAccent ?? base.colors.accent,
      primary: overrides.themePrimary ?? base.colors.primary,
      secondary: overrides.themeSecondary ?? base.colors.secondary,
      background: overrides.themeBackground ?? base.colors.background,
      border: overrides.themeBorder ?? base.colors.border,
      text: overrides.themeText ?? base.colors.text,
    },
  };
}

export function themeToCssVars(t: ThemeTokens): CSSProperties {
  const vars: Record<string, string> = {
    "--menu-background": t.colors.background,
    "--menu-surface": t.colors.surface,
    "--menu-surface-alt": t.colors.surfaceAlt,
    "--menu-text": t.colors.text,
    "--menu-text-muted": t.colors.textMuted,
    "--menu-border": t.colors.border,
    "--menu-accent": t.colors.accent,
    "--menu-accent-text": t.colors.accentText,
    "--menu-primary": t.colors.primary,
    "--menu-secondary": t.colors.secondary,
    "--menu-hero-scrim": t.colors.heroScrim,
    "--menu-font-display": t.fonts.display,
    "--menu-font-body": t.fonts.body,
    "--menu-radius-card": t.radiusCard,
    "--menu-shadow": t.shadow,
    "--menu-hero-height": t.heroHeight,
  };
  return vars as CSSProperties;
}
