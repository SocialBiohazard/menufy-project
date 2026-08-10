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
  { id: 1, nameTr: "Gluten içeren tahıllar", nameEn: "Cereals containing gluten", nameAr: "الحبوب المحتوية على الغلوتين", nameRu: "Злаки, содержащие глютен", icon: "🌾" },
  { id: 2, nameTr: "Kabuklu deniz ürünleri", nameEn: "Crustaceans", nameAr: "القشريات", nameRu: "Ракообразные", icon: "🦐" },
  { id: 3, nameTr: "Yumurta", nameEn: "Eggs", nameAr: "البيض", nameRu: "Яйца", icon: "🥚" },
  { id: 4, nameTr: "Balık", nameEn: "Fish", nameAr: "السمك", nameRu: "Рыба", icon: "🐟" },
  { id: 5, nameTr: "Yer fıstığı", nameEn: "Peanuts", nameAr: "الفول السوداني", nameRu: "Арахис", icon: "🥜" },
  { id: 6, nameTr: "Soya fasulyesi", nameEn: "Soybeans", nameAr: "فول الصويا", nameRu: "Соя", icon: "🫛" },
  { id: 7, nameTr: "Süt", nameEn: "Milk", nameAr: "الحليب", nameRu: "Молоко", icon: "🥛" },
  { id: 8, nameTr: "Sert kabuklu yemişler", nameEn: "Tree nuts", nameAr: "المكسرات", nameRu: "Орехи", icon: "🌰" },
  { id: 9, nameTr: "Kereviz", nameEn: "Celery", nameAr: "الكرفس", nameRu: "Сельдерей", icon: "🥬" },
  { id: 10, nameTr: "Hardal", nameEn: "Mustard", nameAr: "الخردل", nameRu: "Горчица", icon: "🌭" },
  { id: 11, nameTr: "Susam", nameEn: "Sesame seeds", nameAr: "السمسم", nameRu: "Кунжут", icon: "🌱" },
  { id: 12, nameTr: "Kükürt dioksit ve sülfitler", nameEn: "Sulphur dioxide and sulphites", nameAr: "ثاني أكسيد الكبريت والكبريتات", nameRu: "Диоксид серы и сульфиты", icon: "🧪" },
  { id: 13, nameTr: "Acı bakla (Lupin)", nameEn: "Lupin", nameAr: "الترمس", nameRu: "Люпин", icon: "🌼" },
  { id: 14, nameTr: "Yumuşakçalar", nameEn: "Molluscs", nameAr: "الرخويات", nameRu: "Моллюски", icon: "🦪" },
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
