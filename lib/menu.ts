import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// The full shape a diner page needs: restaurant + ordered categories, each with
// ordered items, each with allergens (+ the allergen lookup) and nutrition.
export const menuInclude = {
  categories: {
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          allergens: { include: { allergen: true } },
          nutrition: true,
        },
      },
    },
  },
} satisfies Prisma.RestaurantInclude;

export type MenuData = Prisma.RestaurantGetPayload<{ include: typeof menuInclude }>;
export type MenuCategory = MenuData["categories"][number];
export type MenuItem = MenuCategory["items"][number];

function hydrateSnapshot(value: unknown): MenuData | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const menu = structuredClone(value) as MenuData & {
    createdAt: Date | string;
    updatedAt: Date | string;
    publishedAt?: Date | string | null;
    draftUpdatedAt?: Date | string | null;
    lastPriceChangeAt: Date | string | null;
  };
  menu.createdAt = new Date(menu.createdAt);
  menu.updatedAt = new Date(menu.updatedAt);
  if (menu.publishedAt) menu.publishedAt = new Date(menu.publishedAt);
  if (menu.draftUpdatedAt) menu.draftUpdatedAt = new Date(menu.draftUpdatedAt);
  if (menu.lastPriceChangeAt) menu.lastPriceChangeAt = new Date(menu.lastPriceChangeAt);
  return menu as MenuData;
}

export function dinerMenu(menu: MenuData | null): MenuData | null {
  if (!menu) return null;
  const categories = menu.categories.filter((category) => category.items.length > 0);
  if (!categories.length) return null;
  return { ...menu, categories };
}

export async function currentMenuData(id: string): Promise<MenuData | null> {
  return prisma.restaurant.findUnique({ where: { id }, include: menuInclude });
}

export async function publishedSnapshotFor(
  id: string,
): Promise<Prisma.InputJsonValue | null> {
  const menu = await currentMenuData(id);
  if (!menu) return null;
  const snapshot = JSON.parse(JSON.stringify(menu)) as Record<string, unknown>;
  // Never nest an older publication inside a newer one.
  delete snapshot.publishedSnapshot;
  return snapshot as Prisma.InputJsonValue;
}

/** Published restaurant by slug, with its whole menu. `null` if missing/unpublished. */
export async function getPublishedRestaurant(slug: string): Promise<MenuData | null> {
  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, isPublished: true },
    select: { id: true, publishedSnapshot: true },
  });
  if (!restaurant) return null;
  return dinerMenu(hydrateSnapshot(restaurant.publishedSnapshot));
}

/** Development-only visual fixture lookup. Callers must enforce the env guard. */
export async function getRestaurantForVisualPreview(slug: string): Promise<MenuData | null> {
  return prisma.restaurant.findUnique({
    where: { slug },
    include: menuInclude,
  });
}

/** Published restaurant mapped to an exact custom hostname. */
export async function getPublishedRestaurantByHostname(hostname: string): Promise<MenuData | null> {
  const restaurant = await prisma.restaurant.findFirst({
    where: { publicHostname: hostname.toLowerCase(), isPublished: true },
    select: { id: true, publishedSnapshot: true },
  });
  if (!restaurant) return null;
  return dinerMenu(hydrateSnapshot(restaurant.publishedSnapshot));
}

/** Development-only hostname fixture lookup. */
export async function getRestaurantForHostnamePreview(hostname: string): Promise<MenuData | null> {
  return prisma.restaurant.findUnique({
    where: { publicHostname: hostname.toLowerCase() },
    include: menuInclude,
  });
}
