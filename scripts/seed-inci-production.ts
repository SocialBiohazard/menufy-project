import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client";

const connectionString =
  process.env.DATABASE_PUBLIC_URL ??
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_PUBLIC_URL, DIRECT_URL, or DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Başlangıçlar",
    nameEn: "Starters",
    nameAr: "المقبلات",
    items: [
      ["Humus", "Hummus", "حمص", "Nohut, tahin ve zeytinyağı", 180],
      ["Sıcak Meze", "Hot Starter", "مقبلات ساخنة", "Günün sıcak meze seçimi", 240],
    ],
  },
  {
    name: "Izgara & Kebap",
    nameEn: "Grill & Kebab",
    nameAr: "المشاوي والكباب",
    items: [
      ["Adana Kebap", "Adana Kebab", "كباب أضنة", "Közlenmiş biber ve pilav ile", 460],
      ["Karışık Izgara", "Mixed Grill", "مشاوي مشكلة", "Izgara çeşitlerinden seçki", 720],
    ],
  },
  {
    name: "Pide & Lahmacun",
    nameEn: "Pide & Lahmacun",
    nameAr: "بيدا ولحم بعجين",
    items: [
      ["Kıymalı Pide", "Minced Beef Pide", "بيدا باللحم", "Taş fırında günlük hazırlanır", 360],
      ["Lahmacun", "Lahmacun", "لحم بعجين", "Maydanoz, limon ve sumak ile", 170],
    ],
  },
  {
    name: "Ana Yemekler",
    nameEn: "Main Courses",
    nameAr: "الأطباق الرئيسية",
    items: [
      ["Testi Kebabı", "Pottery Kebab", "كباب الفخار", "Toprak testide ağır pişmiş et ve sebzeler", 680],
      ["Günün Yemeği", "Dish of the Day", "طبق اليوم", "Günlük olarak değişir", 390],
    ],
  },
  {
    name: "Tatlılar",
    nameEn: "Desserts",
    nameAr: "الحلويات",
    items: [
      ["Künefe", "Künefe", "كنافة", "Sıcak servis edilir", 250],
      ["Fırın Sütlaç", "Baked Rice Pudding", "أرز بالحليب", "Geleneksel fırın sütlaç", 190],
    ],
  },
  {
    name: "İçecekler",
    nameEn: "Drinks",
    nameAr: "المشروبات",
    items: [
      ["Türk Kahvesi", "Turkish Coffee", "قهوة تركية", "Lokum ile", 110],
      ["Çay", "Tea", "شاي", "İnce belli bardakta", 55],
    ],
  },
] as const;

const menuInclude = {
  categories: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      items: {
        orderBy: { sortOrder: "asc" as const },
        include: {
          allergens: { include: { allergen: true } },
          nutrition: true,
        },
      },
    },
  },
} satisfies Prisma.RestaurantInclude;

async function main() {
  const slug = "inci-restaurant";
  let restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: menuInclude,
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        slug,
        businessName: "İnci Cafe Restaurant",
        businessType: "Cafe · Restaurant",
        logo: "/templates/inci-heritage/inci-logo-prototype.png",
        splashImage: "/templates/inci-heritage/background.webp",
        splashEnabled: true,
        templateType: "inci-heritage",
        defaultLang: "tr",
        enabledLangs: ["tr", "en", "ar"],
        currencyCode: "TRY",
        allergenNotice: "Alerjen hassasiyetiniz varsa lütfen ekibimize danışın.",
        allergenNoticeEn: "Please ask our team if you have an allergen sensitivity.",
        allergenNoticeAr: "يرجى سؤال فريقنا إذا كانت لديكم حساسية غذائية.",
        categories: {
          create: categories.map((category, categoryIndex) => ({
            name: category.name,
            nameEn: category.nameEn,
            nameAr: category.nameAr,
            sortOrder: categoryIndex,
            items: {
              create: category.items.map(
                ([name, nameEn, nameAr, description, price], itemIndex) => ({
                  name,
                  nameEn,
                  nameAr,
                  description,
                  price,
                  sortOrder: itemIndex,
                }),
              ),
            },
          })),
        },
      },
      include: menuInclude,
    });
  }

  const now = new Date();
  const snapshot = JSON.parse(JSON.stringify(restaurant)) as Record<string, unknown>;
  delete snapshot.publishedSnapshot;

  const published = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      templateType: "inci-heritage",
      isPublished: true,
      publishedSnapshot: snapshot as Prisma.InputJsonValue,
      publishedAt: now,
      draftUpdatedAt: now,
    },
    select: {
      id: true,
      slug: true,
      businessName: true,
      templateType: true,
      isPublished: true,
      publishedAt: true,
      _count: { select: { categories: true } },
    },
  });

  console.log(JSON.stringify(published));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
