import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  InvalidImageError,
  MAX_OUTPUT_IMAGE_BYTES,
  optimizeImage,
} from "../lib/image-processing";
import {
  managedStoragePath,
  replacedManagedImages,
} from "../lib/media-storage";

test("uploaded images are decoded, resized, and normalized to WebP", async () => {
  const input = await sharp({
    create: {
      width: 2600,
      height: 1800,
      channels: 3,
      background: "#882634",
    },
  }).png().toBuffer();

  const output = await optimizeImage(input, "image/png", "items");
  const metadata = await sharp(output).metadata();

  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 831);
  assert.ok(output.length < MAX_OUTPUT_IMAGE_BYTES);
});

test("corrupt and MIME-spoofed uploads are rejected", async () => {
  await assert.rejects(
    optimizeImage(Buffer.from("not an image"), "image/png", "items"),
    InvalidImageError,
  );

  const jpeg = await sharp({
    create: {
      width: 20,
      height: 20,
      channels: 3,
      background: "#ffffff",
    },
  }).jpeg().toBuffer();
  await assert.rejects(
    optimizeImage(jpeg, "image/png", "items"),
    InvalidImageError,
  );
});

test("storage cleanup only accepts managed application media URLs", () => {
  const managed = "/media/inci/items/photo.webp";

  assert.equal(managedStoragePath(managed), "inci/items/photo.webp");
  assert.equal(managedStoragePath("https://example.com/photo.webp"), null);
  assert.equal(managedStoragePath("/templates/inci/photo.webp"), null);
  assert.deepEqual(
    replacedManagedImages([
      { previous: managed, next: "/media/inci/items/new.webp" },
      { previous: "same", next: "same" },
    ]),
    [managed],
  );
});
