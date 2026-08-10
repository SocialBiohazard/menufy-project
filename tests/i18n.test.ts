import assert from "node:assert/strict";
import test from "node:test";
import { pick } from "../lib/i18n";
import { translatePanel } from "../lib/panel-i18n-shared";

test("Russian menu content uses its translation and falls back to Turkish", () => {
  assert.equal(pick({ name: "Çorba", nameRu: "Суп" }, "name", "ru"), "Суп");
  assert.equal(pick({ name: "Çorba", nameRu: "" }, "name", "ru"), "Çorba");
});

test("Russian control panels use the complete Russian dictionary", () => {
  assert.equal(translatePanel("ru", "Settings"), "Настройки");
  assert.equal(translatePanel("ru", "Restaurant footer"), "Подвал ресторана");
});
