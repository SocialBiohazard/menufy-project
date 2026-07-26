import assert from "node:assert/strict";
import test from "node:test";
import {
  readInciNavigation,
  writeInciNavigation,
} from "../lib/inci-navigation";

const categories = [
  { id: "grill", itemIds: ["kebab", "steak"] },
  { id: "dessert", itemIds: ["kunefe"] },
  { id: "empty", itemIds: [] },
];

test("deep-linked items restore their category and language", () => {
  assert.deepEqual(
    readInciNavigation(
      new URLSearchParams("item=kunefe&lang=ar"),
      categories,
      ["tr", "en", "ar"],
      "tr",
      true,
    ),
    {
      entered: true,
      categoryId: "dessert",
      itemId: "kunefe",
      lang: "ar",
    },
  );
});

test("invalid navigation input fails back to a safe menu state", () => {
  assert.deepEqual(
    readInciNavigation(
      new URLSearchParams("screen=menu&category=missing&item=missing&lang=ru"),
      categories,
      ["tr", "en"],
      "tr",
      true,
    ),
    {
      entered: true,
      categoryId: null,
      itemId: null,
      lang: "tr",
    },
  );
});

test("navigation URLs preserve unrelated preview parameters", () => {
  assert.equal(
    writeInciNavigation(
      new URLSearchParams("preview=1&item=old"),
      {
        entered: true,
        categoryId: "grill",
        itemId: "kebab",
        lang: "en",
      },
      "tr",
    ),
    "?preview=1&screen=menu&category=grill&item=kebab&lang=en",
  );
});
