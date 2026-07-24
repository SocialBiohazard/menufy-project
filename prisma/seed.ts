import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Seeding is a one-off script; the direct (non-pooled) connection is safest.
const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// The 14 allergens mandated by the Turkish Food Codex (EU Annex II aligned).
// Languages match locked scope ③: TR + EN + AR.
const ALLERGENS = [
  { id: 1, nameTr: "Gluten içeren tahıllar", nameEn: "Cereals containing gluten", nameAr: "الحبوب المحتوية على الغلوتين", icon: "🌾" },
  { id: 2, nameTr: "Kabuklu deniz ürünleri", nameEn: "Crustaceans", nameAr: "القشريات", icon: "🦐" },
  { id: 3, nameTr: "Yumurta", nameEn: "Eggs", nameAr: "البيض", icon: "🥚" },
  { id: 4, nameTr: "Balık", nameEn: "Fish", nameAr: "السمك", icon: "🐟" },
  { id: 5, nameTr: "Yer fıstığı", nameEn: "Peanuts", nameAr: "الفول السوداني", icon: "🥜" },
  { id: 6, nameTr: "Soya fasulyesi", nameEn: "Soybeans", nameAr: "فول الصويا", icon: "🫛" },
  { id: 7, nameTr: "Süt", nameEn: "Milk", nameAr: "الحليب", icon: "🥛" },
  { id: 8, nameTr: "Sert kabuklu yemişler", nameEn: "Tree nuts", nameAr: "المكسرات", icon: "🌰" },
  { id: 9, nameTr: "Kereviz", nameEn: "Celery", nameAr: "الكرفس", icon: "🥬" },
  { id: 10, nameTr: "Hardal", nameEn: "Mustard", nameAr: "الخردل", icon: "🌭" },
  { id: 11, nameTr: "Susam", nameEn: "Sesame seeds", nameAr: "السمسم", icon: "🌱" },
  { id: 12, nameTr: "Kükürt dioksit ve sülfitler", nameEn: "Sulphur dioxide and sulphites", nameAr: "ثاني أكسيد الكبريت والكبريتات", icon: "🧪" },
  { id: 13, nameTr: "Acı bakla (Lupin)", nameEn: "Lupin", nameAr: "الترمس", icon: "🌼" },
  { id: 14, nameTr: "Yumuşakçalar", nameEn: "Molluscs", nameAr: "الرخويات", icon: "🦪" },
];

async function main() {
  for (const a of ALLERGENS) {
    await prisma.allergen.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }
  console.log(`Seeded ${ALLERGENS.length} allergens.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
