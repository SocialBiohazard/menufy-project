type PublicMenuAddress = {
  slug: string;
  publicHostname?: string | null;
  applicationOrigin?: string | null;
};

export function publicMenuUrl({
  slug,
  publicHostname,
  applicationOrigin,
}: PublicMenuAddress): string {
  if (publicHostname) return `https://${publicHostname.toLowerCase()}`;

  const origin = applicationOrigin?.replace(/\/+$/, "");
  return origin ? `${origin}/${slug}` : `/${slug}`;
}
