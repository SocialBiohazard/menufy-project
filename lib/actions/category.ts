"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/activity";
import { requireRestaurantAccess } from "@/lib/authorization";
import { deleteManagedImages, replacedManagedImages } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryInput } from "@/lib/validation";

type Result<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function markDraftAndRevalidate(restaurantId: string) {
  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { draftUpdatedAt: new Date() },
    select: { slug: true },
  });
  revalidatePath(`/dashboard/restaurants/${restaurantId}/menu`);
  revalidatePath(`/portal/restaurants/${restaurantId}/menu`);
  revalidatePath(`/${restaurant.slug}`);
}

export async function createCategory(restaurantId: string, input: CategoryInput) {
  const actor = await requireRestaurantAccess(restaurantId, "EDITOR");
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
      nameRu: parsed.data.nameRu || null,
      imageUrl: parsed.data.imageUrl || null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  await markDraftAndRevalidate(restaurantId);
  await recordAudit({
    actor,
    restaurantId,
    action: "CREATE",
    entityType: "Category",
    entityId: category.id,
    changes: { name: category.name },
  });
  return { ok: true as const, data: category };
}

export async function updateCategory(id: string, input: CategoryInput) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const current = await prisma.category.findUnique({
    where: { id },
    select: { imageUrl: true, restaurantId: true, name: true },
  });
  if (!current) return { ok: false as const, error: "Category not found" };
  const actor = await requireRestaurantAccess(current.restaurantId, "EDITOR");
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      nameEn: parsed.data.nameEn || null,
      nameAr: parsed.data.nameAr || null,
      nameRu: parsed.data.nameRu || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  await deleteManagedImages(
    replacedManagedImages([
      { previous: current.imageUrl, next: parsed.data.imageUrl },
    ]),
  );
  await markDraftAndRevalidate(category.restaurantId);
  await recordAudit({
    actor,
    restaurantId: category.restaurantId,
    action: "UPDATE",
    entityType: "Category",
    entityId: category.id,
    changes: { before: current.name, after: category.name },
  });
  return { ok: true as const, data: category };
}

export async function deleteCategory(id: string): Promise<Result> {
  const current = await prisma.category.findUnique({
    where: { id },
    select: { restaurantId: true },
  });
  if (!current) return { ok: false, error: "Category not found" };
  const actor = await requireRestaurantAccess(current.restaurantId, "EDITOR");
  const category = await prisma.category.delete({
    where: { id },
    include: { items: { select: { imageUrl: true } } },
  });
  await deleteManagedImages([
    category.imageUrl,
    ...category.items.map((item) => item.imageUrl),
  ]);
  await markDraftAndRevalidate(category.restaurantId);
  await recordAudit({
    actor,
    restaurantId: category.restaurantId,
    action: "DELETE",
    entityType: "Category",
    entityId: category.id,
    changes: { name: category.name },
  });
  return { ok: true, data: undefined };
}

export async function reorderCategories(
  restaurantId: string,
  orderedIds: string[],
): Promise<Result> {
  await requireRestaurantAccess(restaurantId, "EDITOR");
  const owned = await prisma.category.count({
    where: { restaurantId, id: { in: orderedIds } },
  });
  if (owned !== orderedIds.length) {
    return { ok: false, error: "Invalid category order" };
  }
  await prisma.$transaction(
    orderedIds.map((id, sortOrder) =>
      prisma.category.update({ where: { id }, data: { sortOrder } }),
    ),
  );
  await markDraftAndRevalidate(restaurantId);
  return { ok: true, data: undefined };
}
