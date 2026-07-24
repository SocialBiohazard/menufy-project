import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedRestaurant, getRestaurantForVisualPreview } from "@/lib/menu";
import { MenuTemplate } from "@/components/menu/MenuTemplate";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const canPreview = process.env.NODE_ENV === "development" && query.preview === "1";
  const menu = canPreview
    ? await getRestaurantForVisualPreview(slug)
    : await getPublishedRestaurant(slug);
  if (!menu) return { title: "Menu not found" };
  return {
    title: `${menu.businessName} — Menü`,
    description: menu.businessType ?? undefined,
  };
}

export default async function DinerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const canPreview = process.env.NODE_ENV === "development" && query.preview === "1";
  const menu = canPreview
    ? await getRestaurantForVisualPreview(slug)
    : await getPublishedRestaurant(slug);
  if (!menu) notFound();
  return <MenuTemplate menu={menu} />;
}
