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
  items: 1600,
  categories: 1600,
  cover: 2400,
  splash: 2400,
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
        quality: kind === "logo" ? 88 : 82,
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
