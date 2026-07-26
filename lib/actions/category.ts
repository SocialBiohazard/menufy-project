"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOperator } from "@/lib/auth";
import { categorySchema, type CategoryInput } from "@/lib/validation";
import { deleteManagedImages, replacedManagedImages } from "@/lib/media-storage";

type Result<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function revalidateRestaurant(restaurantId: string) {
  const r = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true },
  });
  revalidatePath(`/dashboard/restaurants/${restaurantId}/menu`);
  if (r) revalidatePath(`/${r.slug}`);
}

export async function createCategory(restaurantId: string, input: CategoryInput) {
  await requireOperator();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const max = await prisma.category.aggregate({
    where: { restaurantId },
    _max: { sortOrder: true },
  });
  const category = await prisma.category.create({
    data: {
      restaurantId,
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      nameAr: parsed.data.nameAr || null,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  await revalidateRestaurant(restaurantId);
  return { ok: true as const, data: category };
}

export async function updateCategory(id: string, input: CategoryInput) {
  await requireOperator();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const current = await prisma.category.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      nameAr: parsed.data.nameAr || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  await deleteManagedImages(replacedManagedImages([
    { previous: current?.imageUrl, next: parsed.data.imageUrl },
  ]));
  await revalidateRestaurant(category.restaurantId);
  return { ok: true as const, data: category };
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireOperator();
  const category = await prisma.category.delete({
    where: { id },
    include: { items: { select: { imageUrl: true } } },
  });
  await deleteManagedImages([
    category.imageUrl,
    ...category.items.map((item) => item.imageUrl),
  ]);
  await revalidateRestaurant(category.restaurantId);
  return { ok: true, data: undefined };
}

export async function reorderCategories(
  restaurantId: string,
  orderedIds: string[],
): Promise<Result> {
  await requireOperator();
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.category.update({ where: { id }, data: { sortOrder: i } }),
    ),
  );
  await revalidateRestaurant(restaurantId);
  return { ok: true, data: undefined };
}
