import { type NextRequest, NextResponse } from "next/server";
import {
  isTenantPassthroughPath,
  isTenantRestrictedPath,
} from "@/lib/tenant-routing";

function hostnameOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isMainApplicationHost(hostname: string) {
  const main = hostnameOf(process.env.NEXT_PUBLIC_SITE_URL);
  const railway = hostnameOf(process.env.RAILWAY_PUBLIC_DOMAIN);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    hostname === "healthcheck.railway.app" ||
    hostname === main ||
    hostname === railway
  );
}

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") || "").split(":")[0].toLowerCase();

  if (hostname && !isMainApplicationHost(hostname)) {
    if (isTenantRestrictedPath(request.nextUrl.pathname)) {
      return new NextResponse(null, { status: 404 });
    }
    if (isTenantPassthroughPath(request.nextUrl.pathname)) {
      return NextResponse.next({ request });
    }
    const url = request.nextUrl.clone();
    url.pathname = `/tenant-host/${encodeURIComponent(hostname)}`;
    url.search = "";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
