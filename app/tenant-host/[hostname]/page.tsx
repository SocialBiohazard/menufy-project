import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedRestaurantByHostname, getRestaurantForHostnamePreview } from "@/lib/menu";
import { MenuTemplate } from "@/components/menu/MenuTemplate";

async function getMenu(hostname: string) {
  return process.env.NODE_ENV === "development"
    ? getRestaurantForHostnamePreview(hostname)
    : getPublishedRestaurantByHostname(hostname);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hostname: string }>;
}): Promise<Metadata> {
  const { hostname } = await params;
  const menu = await getMenu(decodeURIComponent(hostname));
  if (!menu) return { title: "Menu not found" };
  return {
    title: `${menu.businessName} — Menü`,
    description: menu.businessType ?? undefined,
    alternates: { canonical: `https://${menu.publicHostname}` },
  };
}

export default async function TenantMenuPage({
  params,
}: {
  params: Promise<{ hostname: string }>;
}) {
  const { hostname } = await params;
  const menu = await getMenu(decodeURIComponent(hostname));
  if (!menu) notFound();
  return <MenuTemplate menu={menu} />;
}
