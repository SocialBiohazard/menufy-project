import sharp from "sharp";

export const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_OUTPUT_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_INPUT_PIXELS = 40_000_000;

const MIME_FORMAT = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
} as const;

const MAX_EDGE_BY_KIND: Record<string, number> = {
  logo: 1200,
  items: 1200,
  categories: 1200,
  cover: 1600,
  splash: 1600,
};

const QUALITY_BY_KIND: Record<string, number> = {
  logo: 88,
  items: 78,
  categories: 78,
  cover: 68,
  splash: 68,
};

export class InvalidImageError extends Error {}

export async function optimizeImage(
  source: Buffer,
  declaredMime: string,
  kind: string,
): Promise<Buffer> {
  if (source.length === 0 || source.length > MAX_SOURCE_IMAGE_BYTES) {
    throw new InvalidImageError("Use an image smaller than 8 MB");
  }

  const expectedFormat = MIME_FORMAT[declaredMime as keyof typeof MIME_FORMAT];
  if (!expectedFormat) {
    throw new InvalidImageError("Only PNG, JPEG, and WebP images are supported");
  }

  try {
    const image = sharp(source, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
      sequentialRead: true,
    });
    const metadata = await image.metadata();

    if (
      metadata.format !== expectedFormat ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) !== 1
    ) {
      throw new InvalidImageError("The file is not a valid supported image");
    }

    const maxEdge = MAX_EDGE_BY_KIND[kind] ?? 1600;
    const output = await image
      .rotate()
      .resize({
        width: maxEdge,
        height: maxEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: QUALITY_BY_KIND[kind] ?? 78,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer();

    if (output.length > MAX_OUTPUT_IMAGE_BYTES) {
      throw new InvalidImageError("The optimized image is still too large");
    }
    return output;
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError("The image is corrupt or could not be decoded");
  }
}
