import assert from "node:assert/strict";
import test from "node:test";
import { allergenName, LANGS, pick } from "../lib/i18n";
import { PANEL_LOCALES, translatePanel } from "../lib/panel-i18n-shared";

test("Russian menu content uses its translation and falls back to Turkish", () => {
  assert.equal(pick({ name: "Çorba", nameRu: "Суп" }, "name", "ru"), "Суп");
  assert.equal(pick({ name: "Çorba", nameRu: "" }, "name", "ru"), "Çorba");
});

test("Russian control panels use the complete Russian dictionary", () => {
  assert.equal(translatePanel("ru", "Settings"), "Настройки");
  assert.equal(translatePanel("ru", "Restaurant footer"), "Подвал ресторана");
});

test("menu and panel language catalogs expose the full ten-language set", () => {
  const expected = ["tr", "en", "ar", "ru", "de", "fr", "es", "it", "pl", "zh"];
  assert.deepEqual([...LANGS], expected);
  assert.deepEqual([...PANEL_LOCALES], ["en", "tr", "ar", "ru", "de", "fr", "es", "it", "pl", "zh"]);
});

test("new menu languages use their stored translations and Turkish fallback", () => {
  const item = {
    name: "Corba", nameDe: "Suppe", nameFr: "Soupe", nameEs: "Sopa",
    nameIt: "Zuppa", namePl: "Zupa", nameZh: "汤",
  };
  assert.equal(pick(item, "name", "de"), "Suppe");
  assert.equal(pick(item, "name", "fr"), "Soupe");
  assert.equal(pick(item, "name", "es"), "Sopa");
  assert.equal(pick(item, "name", "it"), "Zuppa");
  assert.equal(pick(item, "name", "pl"), "Zupa");
  assert.equal(pick(item, "name", "zh"), "汤");
  assert.equal(pick({ name: "Corba", nameDe: "" }, "name", "de"), "Corba");
});

test("allergen labels localize for the expanded language set", () => {
  const gluten = { id: 1, nameTr: "Gluten", nameEn: "Gluten" };
  assert.equal(allergenName(gluten, "de"), "Glutenhaltiges Getreide");
  assert.equal(allergenName(gluten, "it"), "Cereali contenenti glutine");
});

test("new panel locales translate core navigation", () => {
  assert.equal(translatePanel("de", "Settings"), "Einstellungen");
  assert.equal(translatePanel("fr", "Customers"), "Clients");
  assert.equal(translatePanel("es", "Languages"), "Idiomas");
  assert.equal(translatePanel("it", "Menu builder"), "Editor del menù");
  assert.equal(translatePanel("pl", "Footer"), "Stopka");
  assert.equal(translatePanel("zh", "Restaurants"), "餐厅");
});
