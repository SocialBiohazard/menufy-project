export function isManagedMediaUrl(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith("/media/"));
}
