import assert from "node:assert/strict";
import test from "node:test";
import { isManagedMediaUrl } from "../lib/media-url";

test("managed media URLs bypass Next image optimization", () => {
  assert.equal(isManagedMediaUrl("/media/inci-restaurant/items/photo.webp"), true);
  assert.equal(isManagedMediaUrl("/templates/inci-heritage/background.webp"), false);
  assert.equal(isManagedMediaUrl("https://example.com/photo.webp"), false);
});
