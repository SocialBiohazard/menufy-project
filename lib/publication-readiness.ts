type PublishableRestaurant = {
  businessName: string;
  slug: string;
  templateType: string;
  currencyCode: string;
  defaultLang: string;
  enabledLangs: string[];
  categories: { items: { id: string }[] }[];
};

export function publicationIssues(
  restaurant: PublishableRestaurant,
  registeredTemplateIds: readonly string[],
): string[] {
  const issues: string[] = [];

  if (!restaurant.businessName.trim()) issues.push("Add a business name");
  if (!restaurant.slug.trim()) issues.push("Add a public slug");
  if (!registeredTemplateIds.includes(restaurant.templateType)) {
    issues.push("Choose a registered template");
  }
  if (!/^[A-Z]{3}$/.test(restaurant.currencyCode)) {
    issues.push("Set a valid 3-letter currency code");
  }
  if (restaurant.enabledLangs.length === 0) issues.push("Enable at least one language");
  if (!restaurant.enabledLangs.includes(restaurant.defaultLang)) {
    issues.push("Make the default language one of the enabled languages");
  }
  if (!restaurant.categories.some((category) => category.items.length > 0)) {
    issues.push("Add at least one menu item");
  }

  return issues;
}
