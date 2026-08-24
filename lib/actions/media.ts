"use server";

import { after } from "next/server";
import {
  requireRestaurantAccess,
} from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import {
  InvalidImageError,
  MAX_SOURCE_IMAGE_BYTES,
  optimizeImage,
} from "@/lib/image-processing";
import {
  deleteManagedImages,
  managedStoragePath,
  storeManagedImage,
} from "@/lib/media-storage";

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const WARM_VARIANTS: Record<string, Array<{ quality: number; width: number }>> = {
  logo: [
    { width: 128, quality: 75 },
    { width: 384, quality: 75 },
  ],
  items: [
    { width: 256, quality: 75 },
    { width: 640, quality: 75 },
    { width: 750, quality: 75 },
    { width: 1080, quality: 75 },
    { width: 1200, quality: 75 },
  ],
  categories: [{ width: 640, quality: 75 }],
  cover: [{ width: 1920, quality: 60 }],
  splash: [{ width: 1920, quality: 60 }],
};

async function warmImageVariants({
  imageUrl,
  kind,
  publicHostname,
}: {
  imageUrl: string;
  kind: string;
  publicHostname?: string | null;
}) {
  const variants = WARM_VARIANTS[kind];
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = publicHostname
    ? `https://${publicHostname}`
    : configuredOrigin;
  if (!origin || !variants) return;

  await Promise.allSettled(
    variants.map(async ({ width, quality }) => {
      const endpoint = new URL("/_next/image", new URL(origin).origin);
      endpoint.searchParams.set("url", imageUrl);
      endpoint.searchParams.set("w", String(width));
      endpoint.searchParams.set("q", String(quality));
      const response = await fetch(endpoint, {
        headers: { Accept: "image/webp" },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.ok) await response.arrayBuffer();
    }),
  );
}

/**
 * Optimizes and stores an image through the configured media driver.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  const slug = (formData.get("slug") as string) || "misc";
  const kind = (formData.get("kind") as string) || "items";
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true, publicHostname: true },
  });
  if (!restaurant) return { ok: false, error: "Restaurant not found" };
  await requireRestaurantAccess(restaurant.id, "EDITOR");
  if (file.size === 0 || file.size > MAX_SOURCE_IMAGE_BYTES) {
    return { ok: false, error: "Use a PNG, JPEG, or WebP image smaller than 8 MB" };
  }

  let buffer: Buffer;
  try {
    buffer = await optimizeImage(
      Buffer.from(await file.arrayBuffer()),
      file.type,
      kind,
    );
  } catch (error) {
    return {
      ok: false,
      error: error instanceof InvalidImageError ? error.message : "Image processing failed",
    };
  }

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 80) || "misc";
  const safeKind = kind.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40) || "items";
  const path = `${safeSlug}/${safeKind}/${crypto.randomUUID()}.webp`;
  try {
    const url = await storeManagedImage(path, buffer);
    after(() => warmImageVariants({
      imageUrl: url,
      kind: safeKind,
      publicHostname: restaurant.publicHostname,
    }));
    return { ok: true, url };
  } catch {
    return { ok: false, error: "Media storage is not configured or unavailable" };
  }
}

export async function discardUploadedImage(
  value: string,
  restaurantSlug: string,
): Promise<void> {
  const storagePath = managedStoragePath(value);
  if (!storagePath) return;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { id: true },
  });
  if (!restaurant) return;
  await requireRestaurantAccess(restaurant.id, "EDITOR");

  const safeSlug =
    restaurantSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 80) ||
    "misc";
  if (!storagePath.startsWith(`${safeSlug}/`)) return;

  const [restaurantReference, category, item] = await Promise.all([
    prisma.restaurant.findFirst({
      where: {
        OR: [
          { logo: value },
          { coverImage: value },
          { splashImage: value },
        ],
      },
      select: { id: true },
    }),
    prisma.category.findFirst({
      where: { imageUrl: value },
      select: { id: true },
    }),
    prisma.item.findFirst({
      where: { imageUrl: value },
      select: { id: true },
    }),
  ]);

  if (!restaurantReference && !category && !item) {
    await deleteManagedImages([value]);
  }
}
