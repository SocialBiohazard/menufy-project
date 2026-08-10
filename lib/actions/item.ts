"use server";

import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/activity";
import { requireRestaurantAccess } from "@/lib/authorization";
import { deleteManagedImages, replacedManagedImages } from "@/lib/media-storage";
import { prisma } from "@/lib/prisma";
import { itemSchema, type ItemInput } from "@/lib/validation";

type Result<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const itemInclude = { allergens: true, nutrition: true } as const;

async function categoryContext(categoryId: string) {
  return prisma.category.findUnique({
    where: { id: categoryId },
    select: { restaurantId: true, restaurant: { select: { slug: true } } },
  });
}

async function markDraftAndRevalidate(categoryId: string) {
  const context = await categoryContext(categoryId);
  if (!context) return;
  await prisma.restaurant.update({
    where: { id: context.restaurantId },
    data: { draftUpdatedAt: new Date() },
  });
  revalidatePath(`/dashboard/restaurants/${context.restaurantId}/menu`);
  revalidatePath(`/portal/restaurants/${context.restaurantId}/menu`);
  revalidatePath(`/${context.restaurant.slug}`);
}

function scalarData(d: ItemInput) {
  return {
    name: d.name,
    nameEn: d.nameEn || null,
    nameAr: d.nameAr || null,
    nameRu: d.nameRu || null,
    nameDe: d.nameDe || null,
    nameFr: d.nameFr || null,
    nameEs: d.nameEs || null,
    nameIt: d.nameIt || null,
    namePl: d.namePl || null,
    nameZh: d.nameZh || null,
    description: d.description || null,
    descriptionEn: d.descriptionEn || null,
    descriptionAr: d.descriptionAr || null,
    descriptionRu: d.descriptionRu || null,
    descriptionDe: d.descriptionDe || null,
    descriptionFr: d.descriptionFr || null,
    descriptionEs: d.descriptionEs || null,
    descriptionIt: d.descriptionIt || null,
    descriptionPl: d.descriptionPl || null,
    descriptionZh: d.descriptionZh || null,
    price: d.price,
    portionGrams: d.portionGrams ?? null,
    imageUrl: d.imageUrl || null,
    ingredients: d.ingredients || null,
    isNew: d.isNew,
    isFeatured: d.isFeatured,
    isAvailable: d.isAvailable,
    hasAlcohol: d.hasAlcohol,
    hasPork: d.hasPork,
  };
}

function hasNutrition(d: ItemInput) {
  return [
    d.energyKcal,
    d.protein,
    d.fat,
    d.saturatedFat,
    d.carbohydrate,
    d.sugar,
    d.fiber,
    d.saltG,
  ].some((value) => value != null);
}

function nutritionData(d: ItemInput) {
  return {
    energyKcal: d.energyKcal ?? null,
    protein: d.protein ?? null,
    fat: d.fat ?? null,
    saturatedFat: d.saturatedFat ?? null,
    carbohydrate: d.carbohydrate ?? null,
    sugar: d.sugar ?? null,
    fiber: d.fiber ?? null,
    saltG: d.saltG ?? null,
    basis: d.nutritionBasis ?? null,
    isEstimated: d.nutritionEstimated,
  };
}

export async function createItem(categoryId: string, input: ItemInput) {
  const context = await categoryContext(categoryId);
  if (!context) return { ok: false as const, error: "Category not found" };
  const actor = await requireRestaurantAccess(context.restaurantId, "EDITOR");
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  const max = await prisma.item.aggregate({
    where: { categoryId },
    _max: { sortOrder: true },
  });
  const item = await prisma.item.create({
    data: {
      categoryId,
      ...scalarData(d),
      sortOrder: (max._max.sortOrder ?? -1) + 1,
      allergens: d.allergenIds.length
        ? { create: d.allergenIds.map((id) => ({ allergen: { connect: { id } } })) }
        : undefined,
      nutrition: hasNutrition(d) ? { create: nutritionData(d) } : undefined,
    },
    include: itemInclude,
  });
  await markDraftAndRevalidate(categoryId);
  await recordAudit({
    actor,
    restaurantId: context.restaurantId,
    action: "CREATE",
    entityType: "Item",
    entityId: item.id,
    changes: { name: item.name, price: item.price },
  });
  return { ok: true as const, data: item };
}

export async function updateItem(id: string, input: ItemInput) {
  const current = await prisma.item.findUnique({
    where: { id },
    select: {
      imageUrl: true,
      name: true,
      price: true,
      categoryId: true,
      category: { select: { restaurantId: true } },
    },
  });
  if (!current) return { ok: false as const, error: "Item not found" };
  const actor = await requireRestaurantAccess(
    current.category.restaurantId,
    "EDITOR",
  );
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  await prisma.$transaction(async (tx) => {
    await tx.itemAllergen.deleteMany({ where: { itemId: id } });
    if (d.allergenIds.length) {
      await tx.itemAllergen.createMany({
        data: d.allergenIds.map((allergenId) => ({ itemId: id, allergenId })),
      });
    }
    if (hasNutrition(d)) {
      await tx.nutrition.upsert({
        where: { itemId: id },
        create: { itemId: id, ...nutritionData(d) },
        update: nutritionData(d),
      });
    } else {
      await tx.nutrition.deleteMany({ where: { itemId: id } });
    }
  });
  const item = await prisma.item.update({
    where: { id },
    data: scalarData(d),
    include: itemInclude,
  });
  await deleteManagedImages(
    replacedManagedImages([{ previous: current.imageUrl, next: d.imageUrl }]),
  );
  await markDraftAndRevalidate(item.categoryId);
  await recordAudit({
    actor,
    restaurantId: current.category.restaurantId,
    action: "UPDATE",
    entityType: "Item",
    entityId: item.id,
    changes: {
      name: { before: current.name, after: item.name },
      price: { before: current.price, after: item.price },
    },
  });
  return { ok: true as const, data: item };
}

export async function deleteItem(id: string): Promise<Result> {
  const current = await prisma.item.findUnique({
    where: { id },
    select: {
      categoryId: true,
      name: true,
      category: { select: { restaurantId: true } },
    },
  });
  if (!current) return { ok: false, error: "Item not found" };
  const actor = await requireRestaurantAccess(
    current.category.restaurantId,
    "EDITOR",
  );
  const item = await prisma.item.delete({ where: { id } });
  await deleteManagedImages([item.imageUrl]);
  await markDraftAndRevalidate(item.categoryId);
  await recordAudit({
    actor,
    restaurantId: current.category.restaurantId,
    action: "DELETE",
    entityType: "Item",
    entityId: id,
    changes: { name: current.name },
  });
  return { ok: true, data: undefined };
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  const current = await prisma.item.findUnique({
    where: { id },
    select: {
      categoryId: true,
      category: { select: { restaurantId: true } },
    },
  });
  if (!current) return { ok: false as const, error: "Item not found" };
  await requireRestaurantAccess(current.category.restaurantId, "EDITOR");
  try {
    const item = await prisma.item.update({
      where: { id },
      data: { isAvailable },
      include: itemInclude,
    });
    await markDraftAndRevalidate(item.categoryId);
    return { ok: true as const, data: item };
  } catch {
    return { ok: false as const, error: "Could not update availability" };
  }
}

export async function reorderItems(
  categoryId: string,
  orderedIds: string[],
): Promise<Result> {
  const context = await categoryContext(categoryId);
  if (!context) return { ok: false, error: "Category not found" };
  await requireRestaurantAccess(context.restaurantId, "EDITOR");
  const owned = await prisma.item.count({
    where: { categoryId, id: { in: orderedIds } },
  });
  if (owned !== orderedIds.length) return { ok: false, error: "Invalid item order" };
  await prisma.$transaction(
    orderedIds.map((id, sortOrder) =>
      prisma.item.update({ where: { id }, data: { sortOrder } }),
    ),
  );
  await markDraftAndRevalidate(categoryId);
  return { ok: true, data: undefined };
}
