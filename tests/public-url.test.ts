import assert from "node:assert/strict";
import test from "node:test";
import { publicMenuUrl } from "../lib/public-url";

test("custom hostname is the canonical customer URL", () => {
  assert.equal(
    publicMenuUrl({
      slug: "ignored",
      publicHostname: "MENU.Example.com",
      applicationOrigin: "https://app.example.com",
    }),
    "https://menu.example.com",
  );
});

test("slug URL uses the configured application origin", () => {
  assert.equal(
    publicMenuUrl({
      slug: "restaurant",
      applicationOrigin: "https://app.example.com/",
    }),
    "https://app.example.com/restaurant",
  );
});

test("local preview can bypass an unconfigured custom hostname", () => {
  assert.equal(
    publicMenuUrl({
      slug: "restaurant",
      publicHostname: "restaurant.test",
      applicationOrigin: "http://localhost:3000",
      preferApplicationOrigin: true,
    }),
    "http://localhost:3000/restaurant",
  );
});

test("server-side fallback remains a relative slug URL", () => {
  assert.equal(publicMenuUrl({ slug: "restaurant" }), "/restaurant");
});
