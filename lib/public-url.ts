type PublicMenuAddress = {
  slug: string;
  publicHostname?: string | null;
  applicationOrigin?: string | null;
  preferApplicationOrigin?: boolean;
};

export function publicMenuUrl({
  slug,
  publicHostname,
  applicationOrigin,
  preferApplicationOrigin = false,
}: PublicMenuAddress): string {
  if (publicHostname && !preferApplicationOrigin) {
    return `https://${publicHostname.toLowerCase()}`;
  }

  const origin = applicationOrigin?.replace(/\/+$/, "");
  return origin ? `${origin}/${slug}` : `/${slug}`;
}
