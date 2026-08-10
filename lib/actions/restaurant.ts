"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireOperator } from "@/lib/auth";
import { requireRestaurantAccess } from "@/lib/authorization";
import { notifyRestaurantMembers, recordAudit } from "@/lib/activity";
import { publishedSnapshotFor } from "@/lib/menu";
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
  const operator = await requireOperator();

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
    },
  });

  await recordAudit({
    actor: {
      type: "OPERATOR",
      id: operator.id,
      email: operator.email,
      role: "OPERATOR",
    },
    restaurantId: restaurant.id,
    action: "CREATE",
    entityType: "Restaurant",
    entityId: restaurant.id,
  });
  revalidatePath("/dashboard");
  return { ok: true, data: { id: restaurant.id } };
}

export async function updateRestaurantCore(
  id: string,
  input: RestaurantCoreInput,
): Promise<ActionResult> {
  const actor = await requireRestaurantAccess(id, "EDITOR");

  const parsed = restaurantCoreSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const submitted = parsed.data;
  const reserved = await prisma.restaurant.findUnique({
    where: { id },
    select: { slug: true, templateType: true, publicHostname: true },
  });
  if (!reserved) return { ok: false, error: "Restaurant not found" };
  const d =
    actor.type === "CUSTOMER"
      ? {
          ...submitted,
          slug: reserved.slug,
          templateType: reserved.templateType,
          publicHostname: reserved.publicHostname ?? "",
        }
      : submitted;

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
  const replacedImages = replacedManagedImages([
    { previous: current?.logo, next: d.logo },
    { previous: current?.coverImage, next: d.coverImage },
    { previous: current?.splashImage, next: d.splashImage },
  ]);

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
      sloganRu: d.sloganRu || null,
      establishedYear: d.establishedYear ?? null,
      currencyCode: d.currencyCode,
      phone: d.phone || null,
      email: d.email || null,
      whatsappNumber: d.whatsappNumber || null,
      websiteUrl: d.websiteUrl || null,
      address: d.address || null,
      city: d.city || null,
      district: d.district || null,
      timezone: d.timezone,
      workingHours: {
        timezone: d.timezone,
        schedule: d.weeklyHours,
        display: d.workingHours || null,
        displayEn: d.workingHoursEn || null,
        displayAr: d.workingHoursAr || null,
        displayRu: d.workingHoursRu || null,
      },
      instagramUrl: d.instagramUrl || null,
      facebookUrl: d.facebookUrl || null,
      tiktokUrl: d.tiktokUrl || null,
      xUrl: d.xUrl || null,
      youtubeUrl: d.youtubeUrl || null,
      googleMapsUrl: d.googleMapsUrl || null,
      googleReviewsUrl: d.googleReviewsUrl || null,
      kdvNotice: d.kdvNotice || null,
      kdvNoticeEn: d.kdvNoticeEn || null,
      kdvNoticeAr: d.kdvNoticeAr || null,
      kdvNoticeRu: d.kdvNoticeRu || null,
      allergenNotice: d.allergenNotice || null,
      allergenNoticeEn: d.allergenNoticeEn || null,
      allergenNoticeAr: d.allergenNoticeAr || null,
      allergenNoticeRu: d.allergenNoticeRu || null,
      nutritionNotice: d.nutritionNotice || null,
      nutritionNoticeEn: d.nutritionNoticeEn || null,
      nutritionNoticeAr: d.nutritionNoticeAr || null,
      nutritionNoticeRu: d.nutritionNoticeRu || null,
      footerDescription: d.footerDescription || null,
      footerDescriptionEn: d.footerDescriptionEn || null,
      footerDescriptionAr: d.footerDescriptionAr || null,
      footerDescriptionRu: d.footerDescriptionRu || null,
      footerCopyright: d.footerCopyright || null,
      footerVisibility: d.footerVisibility,
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
      draftUpdatedAt: new Date(),
    },
  });
  await deleteManagedImages(replacedImages);

  await recordAudit({
    actor,
    restaurantId: id,
    action: "UPDATE",
    entityType: "Restaurant",
    entityId: id,
    changes: { scope: "settings" },
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
  const actor = await requireRestaurantAccess(id, "EDITOR");
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
  const snapshot = isPublished ? await publishedSnapshotFor(id) : null;
  const now = new Date();
  const r = await prisma.restaurant.update({
    where: { id },
    data: {
      isPublished,
      ...(isPublished
        ? {
            publishedSnapshot: snapshot ?? Prisma.JsonNull,
            publishedAt: now,
            draftUpdatedAt: now,
          }
        : {}),
    },
    select: { slug: true },
  });
  await recordAudit({
    actor,
    restaurantId: id,
    action: isPublished ? "PUBLISH" : "UNPUBLISH",
    entityType: "Restaurant",
    entityId: id,
  });
  await notifyRestaurantMembers({
    restaurantId: id,
    type: isPublished ? "MENU_PUBLISHED" : "MENU_UNPUBLISHED",
    title: isPublished ? "Menu published" : "Menu taken offline",
    body:
      actor.type === "CUSTOMER"
        ? `Changed by ${actor.email}`
        : "Changed by Menufy",
    excludeCustomerUserId: actor.type === "CUSTOMER" ? actor.id : undefined,
  });
  revalidatePath("/dashboard");
  revalidatePath(`/${r.slug}`);
  return { ok: true };
}

export async function recordDraftPreview(id: string): Promise<ActionResult> {
  const actor = await requireRestaurantAccess(id, "VIEWER");
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: { draftUpdatedAt: true },
  });
  if (!restaurant) return { ok: false, error: "Restaurant not found" };
  const latestPreview = await prisma.auditLog.findFirst({
    where: {
      restaurantId: id,
      action: "PREVIEW",
      entityType: "Restaurant",
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (
    !latestPreview ||
    (restaurant.draftUpdatedAt &&
      latestPreview.createdAt < restaurant.draftUpdatedAt)
  ) {
    await recordAudit({
      actor,
      restaurantId: id,
      action: "PREVIEW",
      entityType: "Restaurant",
      entityId: id,
    });
  }
  revalidatePath("/portal/welcome");
  return { ok: true };
}

export async function deleteRestaurant(id: string): Promise<ActionResult> {
  const operator = await requireOperator();
  const media = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      customerAccountId: true,
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
  if (!media) return { ok: false, error: "Restaurant not found" };
  if (media.customerAccountId) {
    const accountLocationCount = await prisma.restaurant.count({
      where: { customerAccountId: media.customerAccountId },
    });
    if (accountLocationCount <= 1) {
      return {
        ok: false,
        error:
          "This is a customer workspace's final location. Delete the workspace or assign another location first.",
      };
    }
  }
  const r = await prisma.restaurant.delete({
    where: { id },
    select: { slug: true },
  });
  await recordAudit({
    actor: {
      type: "OPERATOR",
      id: operator.id,
      email: operator.email,
      role: "OPERATOR",
    },
    action: "DELETE",
    entityType: "Restaurant",
    entityId: id,
    changes: { slug: r.slug },
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
