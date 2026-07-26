const PRIVATE_OR_SYSTEM_PREFIXES = [
  "/api",
  "/dashboard",
  "/login",
  "/portal",
  "/portal-preview",
  "/activate",
] as const;

export function isTenantRestrictedPath(pathname: string): boolean {
  return PRIVATE_OR_SYSTEM_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isTenantPassthroughPath(pathname: string): boolean {
  return pathname.startsWith("/media/");
}
