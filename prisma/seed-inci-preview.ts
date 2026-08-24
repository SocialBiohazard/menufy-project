import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// This fixture exists only for local browser/design QA. It is deliberately a
// draft, uses a non-customer slug, and never overwrites an existing record.
const categories = [
  {
    name: "Başlangıçlar", nameEn: "Starters", nameAr: "المقبلات",
    items: [
      ["Humus", "Hummus", "حمص", "Nohut, tahin ve zeytinyağı", 180],
      ["Sıcak Meze", "Hot Starter", "مقبلات ساخنة", "Günün sıcak meze seçimi", 240],
    ],
  },
  {
    name: "Izgara & Kebap", nameEn: "Grill & Kebab", nameAr: "المشاوي والكباب",
    items: [
      ["Adana Kebap", "Adana Kebab", "كباب أضنة", "Közlenmiş biber ve pilav ile", 460],
      ["Karışık Izgara", "Mixed Grill", "مشاوي مشكلة", "Izgara çeşitlerinden seçki", 720],
    ],
  },
  {
    name: "Pide & Lahmacun", nameEn: "Pide & Lahmacun", nameAr: "بيدا ولحم بعجين",
    items: [
      ["Kıymalı Pide", "Minced Beef Pide", "بيدا باللحم", "Taş fırında günlük hazırlanır", 360],
      ["Lahmacun", "Lahmacun", "لحم بعجين", "Maydanoz, limon ve sumak ile", 170],
    ],
  },
  {
    name: "Ana Yemekler", nameEn: "Main Courses", nameAr: "الأطباق الرئيسية",
    items: [
      ["Testi Kebabı", "Pottery Kebab", "كباب الفخار", "Toprak testide ağır pişmiş et ve sebzeler", 680],
      ["Günün Yemeği", "Dish of the Day", "طبق اليوم", "Günlük olarak değişir", 390],
    ],
  },
  {
    name: "Tatlılar", nameEn: "Desserts", nameAr: "الحلويات",
    items: [
      ["Künefe", "Künefe", "كنافة", "Sıcak servis edilir", 250],
      ["Fırın Sütlaç", "Baked Rice Pudding", "أرز بالحليب", "Geleneksel fırın sütlaç", 190],
    ],
  },
  {
    name: "İçecekler", nameEn: "Drinks", nameAr: "المشروبات",
    items: [
      ["Türk Kahvesi", "Turkish Coffee", "قهوة تركية", "Lokum ile", 110],
      ["Çay", "Tea", "شاي", "İnce belli bardakta", 55],
    ],
  },
] as const;

async function main() {
  const slug = "inci-design-preview";
  const existing = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } });
  if (existing) {
    await prisma.restaurant.update({
      where: { id: existing.id },
      data: { publicHostname: "inci-preview.test" },
    });
    console.log(`Preview already exists at /${slug}?preview=1; preserved its menu and refreshed its fixture hostname.`);
    return;
  }

  await prisma.restaurant.create({
    data: {
      slug,
      businessName: "İnci Cafe Restaurant",
      businessType: "Cafe · Restaurant",
      logo: "/templates/inci-heritage/inci-logo-prototype.png",
      splashImage: "/templates/inci-heritage/background.webp",
      splashEnabled: true,
      publicHostname: "inci-preview.test",
      templateType: "inci-heritage",
      defaultLang: "tr",
      enabledLangs: ["tr", "en", "ar"],
      allergenNotice: "Alerjen hassasiyetiniz varsa lütfen ekibimize danışın.",
      allergenNoticeEn: "Please ask our team if you have an allergen sensitivity.",
      allergenNoticeAr: "يرجى سؤال فريقنا إذا كانت لديكم حساسية غذائية.",
      isPublished: false,
      categories: {
        create: categories.map((category, categoryIndex) => ({
          name: category.name,
          nameEn: category.nameEn,
          nameAr: category.nameAr,
          sortOrder: categoryIndex,
          items: {
            create: category.items.map(([name, nameEn, nameAr, description, price], itemIndex) => ({
              name, nameEn, nameAr, description, price, sortOrder: itemIndex,
              portionAmount: itemIndex === 0 ? 250 : null,
              portionUnit: itemIndex === 0 ? "G" : null,
            })),
          },
        })),
      },
    },
  });
  console.log(`Created draft visual fixture at /${slug}?preview=1.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
