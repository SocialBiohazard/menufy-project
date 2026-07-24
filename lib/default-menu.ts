// Editable scaffolding for a broad Turkish cafe-restaurant. These are not
// customer-approved menu claims; operators can rename, reorder, or delete them.
export const DEFAULT_CATEGORIES = [
  { name: "Kahvaltı", nameEn: "Breakfast", nameAr: "الإفطار" },
  { name: "Başlangıçlar", nameEn: "Starters", nameAr: "المقبلات" },
  { name: "Çorbalar", nameEn: "Soups", nameAr: "الشوربات" },
  { name: "Izgara & Kebap", nameEn: "Grill & Kebab", nameAr: "المشاوي والكباب" },
  { name: "Pide & Lahmacun", nameEn: "Pide & Lahmacun", nameAr: "بيدا ولحم بعجين" },
  { name: "Ana Yemekler", nameEn: "Main Courses", nameAr: "الأطباق الرئيسية" },
  { name: "Balıklar", nameEn: "Fish", nameAr: "الأسماك" },
  { name: "Tatlılar", nameEn: "Desserts", nameAr: "الحلويات" },
  { name: "İçecekler", nameEn: "Drinks", nameAr: "المشروبات" },
] as const;
