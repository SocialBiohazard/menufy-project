import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// The full shape a diner page needs: restaurant + ordered categories, each with
// ordered items, each with allergens (+ the allergen lookup) and nutrition.
const menuInclude = {
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

/** Published restaurant by slug, with its whole menu. `null` if missing/unpublished. */
export async function getPublishedRestaurant(slug: string): Promise<MenuData | null> {
  return prisma.restaurant.findFirst({
    where: { slug, isPublished: true },
    include: menuInclude,
  });
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
  return prisma.restaurant.findFirst({
    where: { publicHostname: hostname.toLowerCase(), isPublished: true },
    include: menuInclude,
  });
}

/** Development-only hostname fixture lookup. */
export async function getRestaurantForHostnamePreview(hostname: string): Promise<MenuData | null> {
  return prisma.restaurant.findUnique({
    where: { publicHostname: hostname.toLowerCase() },
    include: menuInclude,
  });
}
