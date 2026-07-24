import { prisma } from "@/lib/prisma";

/** All restaurants for the dashboard, newest first, with category counts. */
export async function listRestaurants() {
  return prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { categories: true } },
    },
  });
}

/** One restaurant with its full menu tree, for the editor/builder. */
export async function getRestaurantForEdit(id: string) {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: { allergens: true, nutrition: true },
          },
        },
      },
    },
  });
}

export type RestaurantWithMenu = NonNullable<
  Awaited<ReturnType<typeof getRestaurantForEdit>>
>;
