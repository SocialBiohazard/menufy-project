import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Allergen ids (see prisma/seed.ts): 1 gluten · 3 eggs · 5 peanuts · 7 milk ·
// 8 tree nuts · 11 sesame.
type SeedItem = {
  name: string; nameEn: string; nameAr: string;
  description?: string; descriptionEn?: string; descriptionAr?: string;
  price: number; img?: string; allergens?: number[];
  isNew?: boolean; isFeatured?: boolean; available?: boolean; ingredients?: string;
};
type SeedCat = {
  name: string; nameEn: string; nameAr: string; img?: string; items: SeedItem[];
};

const MENU: SeedCat[] = [
  {
    name: "Başlangıçlar", nameEn: "Starters", nameAr: "المقبلات",
    items: [
      { name: "Humus", nameEn: "Hummus", nameAr: "حمص",
        description: "Nohut, tahin, limon ve zeytinyağı", descriptionEn: "Chickpea, tahini, lemon and olive oil", descriptionAr: "حمص، طحينة، ليمون وزيت زيتون",
        price: 110, img: img("humus"), allergens: [11], ingredients: "Nohut, tahin, sarımsak" },
      { name: "Haydari", nameEn: "Haydari", nameAr: "حيدري",
        description: "Süzme yoğurt, taze ot ve sarımsak", descriptionEn: "Strained yogurt with herbs and garlic", descriptionAr: "لبن مصفّى بالأعشاب والثوم",
        price: 95, img: img("haydari"), allergens: [7] },
      { name: "Sigara Böreği", nameEn: "Cheese Rolls", nameAr: "بورك بالجبن",
        description: "Çıtır yufka içinde beyaz peynir", descriptionEn: "Crispy pastry filled with white cheese", descriptionAr: "عجينة مقرمشة محشوة بالجبن الأبيض",
        price: 130, img: img("borek"), allergens: [1, 3, 7] },
      { name: "Zeytinyağlı Dolma", nameEn: "Stuffed Vine Leaves", nameAr: "ورق عنب",
        description: "Asma yaprağında pirinç ve baharatlar", descriptionEn: "Vine leaves with rice and spices", descriptionAr: "ورق عنب محشو بالأرز والبهارات",
        price: 120, img: img("dolma") },
    ],
  },
  {
    name: "Izgara", nameEn: "From the Grill", nameAr: "المشاوي",
    items: [
      { name: "Adana Kebap", nameEn: "Adana Kebab", nameAr: "كباب أضنة",
        description: "Acılı el kıyması, közlenmiş biber ile", descriptionEn: "Spicy hand-minced kebab with roasted pepper", descriptionAr: "كباب مفروم حار مع الفلفل المشوي",
        price: 340, img: img("adana"), ingredients: "Kuzu kıyma, acı biber, baharat" },
      { name: "Kuzu Şiş", nameEn: "Lamb Skewer", nameAr: "شيش لحم",
        description: "Marine edilmiş kuzu, közde", descriptionEn: "Marinated lamb, char-grilled", descriptionAr: "لحم ضأن متبّل على الفحم",
        price: 480, img: img("kuzusis"), available: false },
      { name: "Tavuk Şiş", nameEn: "Chicken Skewer", nameAr: "شيش دجاج",
        description: "Yoğurtlu marinasyon, ızgara sebze ile", descriptionEn: "Yogurt-marinated chicken with grilled vegetables", descriptionAr: "دجاج متبّل باللبن مع خضار مشوية",
        price: 300, img: img("tavuksis"), allergens: [7] },
      { name: "Karışık Izgara", nameEn: "Mixed Grill", nameAr: "مشاوي مشكلة",
        description: "Adana, kuzu, tavuk ve köfte", descriptionEn: "Adana, lamb, chicken and köfte", descriptionAr: "أضنة، ضأن، دجاج وكفتة",
        price: 620, img: img("karisik"), isFeatured: true },
      { name: "Köfte", nameEn: "Grilled Köfte", nameAr: "كفتة مشوية",
        description: "El yapımı ızgara köfte", descriptionEn: "Handmade grilled meatballs", descriptionAr: "كفتة مشوية منزلية",
        price: 280, img: img("kofte"), allergens: [1, 3] },
    ],
  },
  {
    name: "Ana Yemekler", nameEn: "Mains", nameAr: "الأطباق الرئيسية",
    items: [
      { name: "Testi Kebabı", nameEn: "Pottery Kebab", nameAr: "كباب الجرة",
        description: "Toprak testide ağır ateşte pişen kuzu", descriptionEn: "Lamb slow-cooked in a sealed clay pot", descriptionAr: "لحم ضأن مطهو ببطء في جرة فخارية",
        price: 520, img: img("testi"), isNew: true },
      { name: "İskender", nameEn: "İskender", nameAr: "إسكندر",
        description: "Döner, tereyağı, domates sosu ve yoğurt", descriptionEn: "Döner with butter, tomato sauce and yogurt", descriptionAr: "دونر مع الزبدة وصلصة الطماطم واللبن",
        price: 390, img: img("iskender"), allergens: [1, 7] },
      { name: "Mantı", nameEn: "Turkish Dumplings", nameAr: "مانتي",
        description: "Yoğurt ve sarımsaklı tereyağı ile", descriptionEn: "Dumplings with yogurt and garlic butter", descriptionAr: "عجينة محشوة باللحم مع اللبن والثوم",
        price: 260, img: img("manti"), allergens: [1, 3, 7] },
    ],
  },
  {
    name: "Tatlılar", nameEn: "Desserts", nameAr: "الحلويات",
    items: [
      { name: "Künefe", nameEn: "Künefe", nameAr: "كنافة",
        description: "Kadayıf, peynir ve şerbet", descriptionEn: "Shredded pastry, cheese and syrup", descriptionAr: "كنافة بالجبن والقطر",
        price: 180, img: img("kunefe"), allergens: [1, 7, 8] },
      { name: "Baklava", nameEn: "Baklava", nameAr: "بقلاوة",
        description: "Antep fıstıklı, kat kat", descriptionEn: "Pistachio, layered", descriptionAr: "بقلاوة بالفستق الحلبي",
        price: 190, img: img("baklava"), allergens: [1, 8] },
      { name: "Sütlaç", nameEn: "Rice Pudding", nameAr: "أرز بالحليب",
        description: "Fırında geleneksel sütlaç", descriptionEn: "Oven-baked traditional rice pudding", descriptionAr: "أرز بالحليب مخبوز",
        price: 130, img: img("sutlac"), allergens: [7] },
    ],
  },
  {
    name: "İçecekler", nameEn: "Drinks", nameAr: "المشروبات",
    items: [
      { name: "Ayran", nameEn: "Ayran", nameAr: "عيران", price: 45, allergens: [7] },
      { name: "Şalgam", nameEn: "Turnip Juice", nameAr: "عصير اللفت", price: 50 },
      { name: "Türk Kahvesi", nameEn: "Turkish Coffee", nameAr: "قهوة تركية", price: 90 },
      { name: "Çay", nameEn: "Tea", nameAr: "شاي", price: 35 },
    ],
  },
];

async function main() {
  const slug = "zeytin-atesi";
  await prisma.restaurant.deleteMany({ where: { slug } });

  await prisma.restaurant.create({
    data: {
      slug,
      businessName: "Zeytin & Ateş",
      businessType: "Anadolu Ateş Mutfağı",
      slogan: "Odun ateşinde, sabırla.",
      sloganEn: "Wood-fired, and worth the wait.",
      sloganAr: "على نار الحطب، بصبر.",
      coverImage: img("zeytin-cover", 1200, 900),
      logo: img("zeytin-logo", 200, 200),
      templateType: "warm-editorial",
      defaultLang: "tr",
      enabledLangs: ["tr", "en", "ar"],
      isPublished: true,
      categories: {
        create: MENU.map((cat, ci) => ({
          name: cat.name,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          imageUrl: cat.img,
          sortOrder: ci,
          items: {
            create: cat.items.map((it, ii) => ({
              name: it.name,
              nameEn: it.nameEn,
              nameAr: it.nameAr,
              description: it.description,
              descriptionEn: it.descriptionEn,
              descriptionAr: it.descriptionAr,
              price: it.price,
              imageUrl: it.img,
              ingredients: it.ingredients,
              isNew: it.isNew ?? false,
              isFeatured: it.isFeatured ?? false,
              isAvailable: it.available ?? true,
              sortOrder: ii,
              allergens: it.allergens?.length
                ? { create: it.allergens.map((id) => ({ allergen: { connect: { id } } })) }
                : undefined,
            })),
          },
        })),
      },
    },
  });

  console.log(`Seeded demo restaurant "/${slug}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
