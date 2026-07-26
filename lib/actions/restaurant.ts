"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DEFAULT_CATEGORIES } from "@/lib/default-menu";
import { requireOperator } from "@/lib/auth";
import { publicationIssues } from "@/lib/publication-readiness";
import { THEMES } from "@/lib/themes";
import { deleteManagedImages, replacedManagedImages } from "@/lib/media-storage";
import {
  restaurantCreateSchema,
  restaurantCoreSchema,
  type RestaurantCreateInput,
  type RestaurantCoreInput,
} from "@/lib/validation";

type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function createRestaurant(
  input: RestaurantCreateInput,
): Promise<ActionResult<{ id: string }>> {
  await requireOperator();

  const parsed = restaurantCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { businessName, slug, businessType, templateType } = parsed.data;

  const existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: `Slug "${slug}" is already in use` };

  const restaurant = await prisma.restaurant.create({
    data: {
      businessName,
      slug,
      businessType: businessType || null,
      templateType,
      categories: {
        create: DEFAULT_CATEGORIES.map((category, sortOrder) => ({
          ...category,
          sortOrder,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  return { ok: true, data: { id: restaurant.id } };
}

export async function updateRestaurantCore(
  id: string,
  input: RestaurantCoreInput,
): Promise<ActionResult> {
  await requireOperator();

  const parsed = restaurantCoreSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  // Slug uniqueness (excluding self).
  const clash = await prisma.restaurant.findFirst({
    where: { slug: d.slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { ok: false, error: `Slug "${d.slug}" is already in use` };

  if (d.publicHostname) {
    const hostnameClash = await prisma.restaurant.findFirst({
      where: { publicHostname: d.publicHostname, NOT: { id } },
      select: { id: true },
    });
    if (hostnameClash) {
      return { ok: false, error: `Hostname "${d.publicHostname}" is already in use` };
    }
  }

  const current = await prisma.restaurant.findUnique({
    where: { id },
    select: { slug: true, logo: true, coverImage: true, splashImage: true },
  });

  await deleteManagedImages(replacedManagedImages([
    { previous: current?.logo, next: d.logo },
    { previous: current?.coverImage, next: d.coverImage },
    { previous: current?.splashImage, next: d.splashImage },
  ]));

  await prisma.restaurant.update({
    where: { id },
    data: {
      businessName: d.businessName,
      slug: d.slug,
      businessType: d.businessType || null,
      templateType: d.templateType,
      categoryNavigationStyle: d.categoryNavigationStyle,
      defaultLang: d.defaultLang,
      enabledLangs: d.enabledLangs,
      logo: d.logo || null,
      coverImage: d.coverImage || null,
      splashImage: d.splashImage || null,
      splashEnabled: d.splashEnabled,
      publicHostname: d.publicHostname || null,
      slogan: d.slogan || null,
      sloganEn: d.sloganEn || null,
      sloganAr: d.sloganAr || null,
      establishedYear: d.establishedYear ?? null,
      currencyCode: d.currencyCode,
      phone: d.phone || null,
      email: d.email || null,
      whatsappNumber: d.whatsappNumber || null,
      websiteUrl: d.websiteUrl || null,
      address: d.address || null,
      city: d.city || null,
      district: d.district || null,
      workingHours: d.workingHours || d.workingHoursEn || d.workingHoursAr
        ? {
            display: d.workingHours || null,
            displayEn: d.workingHoursEn || null,
            displayAr: d.workingHoursAr || null,
          }
        : Prisma.DbNull,
      instagramUrl: d.instagramUrl || null,
      tiktokUrl: d.tiktokUrl || null,
      googleMapsUrl: d.googleMapsUrl || null,
      googleReviewsUrl: d.googleReviewsUrl || null,
      kdvNotice: d.kdvNotice || null,
      kdvNoticeEn: d.kdvNoticeEn || null,
      kdvNoticeAr: d.kdvNoticeAr || null,
      allergenNotice: d.allergenNotice || null,
      allergenNoticeEn: d.allergenNoticeEn || null,
      allergenNoticeAr: d.allergenNoticeAr || null,
      nutritionNotice: d.nutritionNotice || null,
      nutritionNoticeEn: d.nutritionNoticeEn || null,
      nutritionNoticeAr: d.nutritionNoticeAr || null,
      lastPriceChangeAt: d.lastPriceChangeAt
        ? new Date(`${d.lastPriceChangeAt}T00:00:00.000Z`)
        : null,
      attributionText: d.attributionText || null,
      attributionUrl: d.attributionUrl || null,
      themeAccent: d.themeAccent || null,
      themePrimary: d.themePrimary || null,
      themeSecondary: d.themeSecondary || null,
      themeBackground: d.themeBackground || null,
      themeBorder: d.themeBorder || null,
      themeText: d.themeText || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/restaurants/${id}`);
  if (current) revalidatePath(`/${current.slug}`);
  revalidatePath(`/${d.slug}`);
  return { ok: true };
}

export async function togglePublish(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  await requireOperator();
  if (isPublished) {
    const candidate = await prisma.restaurant.findUnique({
      where: { id },
      select: {
        businessName: true,
        slug: true,
        templateType: true,
        currencyCode: true,
        defaultLang: true,
        enabledLangs: true,
        categories: {
          select: {
            items: { select: { id: true }, take: 1 },
          },
        },
      },
    });
    if (!candidate) return { ok: false, error: "Restaurant not found" };

    const issues = publicationIssues(candidate, Object.keys(THEMES));
    if (issues.length > 0) {
      return { ok: false, error: `Cannot publish: ${issues.join("; ")}` };
    }
  }
  const r = await prisma.restaurant.update({
    where: { id },
    data: { isPublished },
    select: { slug: true },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/${r.slug}`);
  return { ok: true };
}

export async function deleteRestaurant(id: string): Promise<ActionResult> {
  await requireOperator();
  const media = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      logo: true,
      coverImage: true,
      splashImage: true,
      categories: {
        select: {
          imageUrl: true,
          items: { select: { imageUrl: true } },
        },
      },
    },
  });
  const r = await prisma.restaurant.delete({
    where: { id },
    select: { slug: true },
  });
  await deleteManagedImages([
    media?.logo,
    media?.coverImage,
    media?.splashImage,
    ...(media?.categories.flatMap((category) => [
      category.imageUrl,
      ...category.items.map((item) => item.imageUrl),
    ]) ?? []),
  ]);
  revalidatePath("/dashboard");
  revalidatePath(`/${r.slug}`);
  return { ok: true };
}
