// Plain, serializable shapes the menu builder works with client-side, plus
// mappers from Prisma query/action results.

export interface BuilderItem {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  nameRu: string;
  description: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionRu: string;
  price: number;
  portionGrams: number | null;
  imageUrl: string;
  ingredients: string;
  isNew: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  hasAlcohol: boolean;
  hasPork: boolean;
  allergenIds: number[];
  energyKcal: number | null;
  protein: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbohydrate: number | null;
  sugar: number | null;
  fiber: number | null;
  saltG: number | null;
  nutritionBasis: string;
  nutritionEstimated: boolean;
}

export interface BuilderCategory {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  nameRu: string;
  imageUrl: string;
  items: BuilderItem[];
}

export interface AllergenOption {
  id: number;
  nameTr: string;
  nameEn: string;
  icon: string;
}

type RawItem = {
  id: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  nameRu: string | null;
  description: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  descriptionRu: string | null;
  price: number;
  portionGrams: number | null;
  imageUrl: string | null;
  ingredients: string | null;
  isNew: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  hasAlcohol: boolean;
  hasPork: boolean;
  allergens: { allergenId: number }[];
  nutrition: {
    energyKcal: number | null;
    protein: number | null;
    fat: number | null;
    saturatedFat: number | null;
    carbohydrate: number | null;
    sugar: number | null;
    fiber: number | null;
    saltG: number | null;
    basis: string | null;
    isEstimated: boolean;
  } | null;
};

type RawCategory = {
  id: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  nameRu: string | null;
  imageUrl: string | null;
  items: RawItem[];
};

export function toBuilderItem(it: RawItem): BuilderItem {
  return {
    id: it.id,
    name: it.name,
    nameEn: it.nameEn ?? "",
    nameAr: it.nameAr ?? "",
    nameRu: it.nameRu ?? "",
    description: it.description ?? "",
    descriptionEn: it.descriptionEn ?? "",
    descriptionAr: it.descriptionAr ?? "",
    descriptionRu: it.descriptionRu ?? "",
    price: it.price,
    portionGrams: it.portionGrams,
    imageUrl: it.imageUrl ?? "",
    ingredients: it.ingredients ?? "",
    isNew: it.isNew,
    isFeatured: it.isFeatured,
    isAvailable: it.isAvailable,
    hasAlcohol: it.hasAlcohol,
    hasPork: it.hasPork,
    allergenIds: it.allergens.map((a) => a.allergenId),
    energyKcal: it.nutrition?.energyKcal ?? null,
    protein: it.nutrition?.protein ?? null,
    fat: it.nutrition?.fat ?? null,
    saturatedFat: it.nutrition?.saturatedFat ?? null,
    carbohydrate: it.nutrition?.carbohydrate ?? null,
    sugar: it.nutrition?.sugar ?? null,
    fiber: it.nutrition?.fiber ?? null,
    saltG: it.nutrition?.saltG ?? null,
    nutritionBasis: it.nutrition?.basis ?? "",
    nutritionEstimated: it.nutrition?.isEstimated ?? false,
  };
}

export function toBuilderCategory(c: RawCategory): BuilderCategory {
  return {
    id: c.id,
    name: c.name,
    nameEn: c.nameEn ?? "",
    nameAr: c.nameAr ?? "",
    nameRu: c.nameRu ?? "",
    imageUrl: c.imageUrl ?? "",
    items: c.items.map(toBuilderItem),
  };
}
