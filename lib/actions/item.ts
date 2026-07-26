"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOperator } from "@/lib/auth";
import { itemSchema, type ItemInput } from "@/lib/validation";
import { deleteManagedImages, replacedManagedImages } from "@/lib/media-storage";

type Result<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const itemInclude = { allergens: true, nutrition: true } as const;

async function revalidateForCategory(categoryId: string) {
  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { restaurantId: true, restaurant: { select: { slug: true } } },
  });
  if (cat) {
    revalidatePath(`/dashboard/restaurants/${cat.restaurantId}/menu`);
    revalidatePath(`/${cat.restaurant.slug}`);
  }
}

function scalarData(d: ItemInput) {
  return {
    name: d.name,
    nameEn: d.nameEn || null,
    nameAr: d.nameAr || null,
    description: d.description || null,
    descriptionEn: d.descriptionEn || null,
    descriptionAr: d.descriptionAr || null,
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
  return (
    d.energyKcal != null ||
    d.protein != null ||
    d.fat != null ||
    d.saturatedFat != null ||
    d.carbohydrate != null ||
    d.sugar != null ||
    d.fiber != null ||
    d.saltG != null
  );
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
  await requireOperator();
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

  await revalidateForCategory(categoryId);
  return { ok: true as const, data: item };
}

export async function updateItem(id: string, input: ItemInput) {
  await requireOperator();
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  const current = await prisma.item.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  // Reset allergens, then re-add.
  await prisma.itemAllergen.deleteMany({ where: { itemId: id } });
  if (d.allergenIds.length) {
    await prisma.itemAllergen.createMany({
      data: d.allergenIds.map((allergenId) => ({ itemId: id, allergenId })),
    });
  }

  // Nutrition upsert or clear.
  if (hasNutrition(d)) {
    await prisma.nutrition.upsert({
      where: { itemId: id },
      create: { itemId: id, ...nutritionData(d) },
      update: nutritionData(d),
    });
  } else {
    await prisma.nutrition.deleteMany({ where: { itemId: id } });
  }

  const item = await prisma.item.update({
    where: { id },
    data: scalarData(d),
    include: itemInclude,
  });
  await deleteManagedImages(replacedManagedImages([
    { previous: current?.imageUrl, next: d.imageUrl },
  ]));

  await revalidateForCategory(item.categoryId);
  return { ok: true as const, data: item };
}

export async function deleteItem(id: string): Promise<Result> {
  await requireOperator();
  const item = await prisma.item.delete({ where: { id } });
  await deleteManagedImages([item.imageUrl]);
  await revalidateForCategory(item.categoryId);
  return { ok: true, data: undefined };
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  await requireOperator();
  try {
    const item = await prisma.item.update({
      where: { id },
      data: { isAvailable },
      include: itemInclude,
    });
    await revalidateForCategory(item.categoryId);
    return { ok: true as const, data: item };
  } catch {
    return { ok: false as const, error: "Could not update availability" };
  }
}

export async function reorderItems(
  categoryId: string,
  orderedIds: string[],
): Promise<Result> {
  await requireOperator();
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.item.update({ where: { id }, data: { sortOrder: i } }),
    ),
  );
  await revalidateForCategory(categoryId);
  return { ok: true, data: undefined };
}
