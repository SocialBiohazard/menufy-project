import assert from "node:assert/strict";
import test from "node:test";
import { publicationIssues } from "../lib/publication-readiness";

const validRestaurant = {
  businessName: "İnci Cafe Restaurant",
  slug: "inci",
  templateType: "inci-heritage",
  currencyCode: "TRY",
  defaultLang: "tr",
  enabledLangs: ["tr", "en", "ar"],
  categories: [{ items: [{ id: "item-1" }] }],
};

test("complete minimum menu can be published", () => {
  assert.deepEqual(
    publicationIssues(validRestaurant, ["inci-heritage"]),
    [],
  );
});

test("empty or stale restaurants cannot be published", () => {
  const issues = publicationIssues(
    {
      ...validRestaurant,
      templateType: "removed-template",
      currencyCode: "TL",
      defaultLang: "tr",
      enabledLangs: ["en"],
      categories: [],
    },
    ["inci-heritage"],
  );

  assert.equal(issues.includes("Choose a registered template"), true);
  assert.equal(issues.includes("Set a valid 3-letter currency code"), true);
  assert.equal(issues.includes("Make the default language one of the enabled languages"), true);
  assert.equal(issues.includes("Add at least one menu item"), true);
});
