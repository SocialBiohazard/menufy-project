"use server";

import { requireOperator } from "@/lib/auth";

const BUCKET = "menu-media";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED = {
  "image/png": { ext: "png", signature: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { ext: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/webp": { ext: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
} as const;

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Uploads an image to Supabase Storage using the service key (server-side only)
 * and returns its public URL. Called from the item/logo/cover image fields.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireOperator();

  const file = formData.get("file");
  const slug = (formData.get("slug") as string) || "misc";
  const kind = (formData.get("kind") as string) || "items";
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    return { ok: false, error: "Use a PNG, JPEG, or WebP image smaller than 8 MB" };
  }

  const allowed = ALLOWED[file.type as keyof typeof ALLOWED];
  if (!allowed) return { ok: false, error: "Only PNG, JPEG, and WebP images are supported" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const signatureMatches = allowed.signature.every((byte, index) => buffer[index] === byte);
  const webpMatches = file.type !== "image/webp" || buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!signatureMatches || !webpMatches) {
    return { ok: false, error: "The file contents do not match the selected image type" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return { ok: false, error: "Media storage is not configured" };

  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 80) || "misc";
  const safeKind = kind.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40) || "items";
  const path = `${safeSlug}/${safeKind}/${crypto.randomUUID()}.${allowed.ext}`;

  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": file.type,
      "x-upsert": "false",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Upload failed (${res.status}) ${text}`.trim() };
  }

  return {
    ok: true,
    url: `${url}/storage/v1/object/public/${BUCKET}/${path}`,
  };
}
