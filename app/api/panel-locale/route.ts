import { NextResponse } from "next/server";
import { isPanelLocale } from "@/lib/panel-i18n-shared";
import { PANEL_LOCALE_COOKIE } from "@/lib/panel-i18n";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const locale =
    body && typeof body === "object" && "locale" in body
      ? (body as { locale?: unknown }).locale
      : null;

  if (!isPanelLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set(PANEL_LOCALE_COOKIE, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

