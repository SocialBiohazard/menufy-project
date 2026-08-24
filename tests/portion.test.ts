import assert from "node:assert/strict";
import test from "node:test";
import { formatPortion } from "../lib/portion";
import { itemSchema } from "../lib/validation";

const baseItem = {
  name: "Mineral water",
  price: 40,
  isNew: false,
  isFeatured: false,
  isAvailable: true,
  hasAlcohol: false,
  hasPork: false,
  allergenIds: [],
  nutritionEstimated: false,
};

test("portion formatter supports food, milliliters, and liters", () => {
  assert.equal(formatPortion(250, "G"), "250 g");
  assert.equal(formatPortion(330, "ML"), "330 ml");
  assert.equal(formatPortion(0.5, "L"), "0.5 L");
  assert.equal(formatPortion(null, null), null);
});

test("item portions require an amount and unit together", () => {
  assert.equal(
    itemSchema.safeParse({ ...baseItem, portionAmount: 330, portionUnit: "ML" }).success,
    true,
  );
  assert.equal(
    itemSchema.safeParse({ ...baseItem, portionAmount: 330, portionUnit: null }).success,
    false,
  );
  assert.equal(
    itemSchema.safeParse({ ...baseItem, portionAmount: null, portionUnit: "L" }).success,
    false,
  );
});
