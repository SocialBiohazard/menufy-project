-- CreateEnum
CREATE TYPE "NavigationStyle" AS ENUM ('DRILLDOWN', 'ACCORDION');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "workingHours" JSONB,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "googleMapsUrl" TEXT,
    "googleReviewsUrl" TEXT,
    "kdvNotice" TEXT,
    "slogan" TEXT,
    "sloganEn" TEXT,
    "sloganAr" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "templateType" TEXT NOT NULL,
    "themeAccent" TEXT,
    "themePrimary" TEXT,
    "themeSecondary" TEXT,
    "themeBackground" TEXT,
    "themeBorder" TEXT,
    "themeText" TEXT,
    "categoryNavigationStyle" "NavigationStyle" NOT NULL DEFAULT 'DRILLDOWN',
    "darkMode" BOOLEAN NOT NULL DEFAULT true,
    "defaultLang" TEXT NOT NULL DEFAULT 'tr',
    "enabledLangs" TEXT[] DEFAULT ARRAY['tr', 'en', 'ar']::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "sortGroup" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "ingredients" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "hasAlcohol" BOOLEAN NOT NULL DEFAULT false,
    "hasPork" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergen" (
    "id" INTEGER NOT NULL,
    "nameTr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemAllergen" (
    "itemId" TEXT NOT NULL,
    "allergenId" INTEGER NOT NULL,

    CONSTRAINT "ItemAllergen_pkey" PRIMARY KEY ("itemId","allergenId")
);

-- CreateTable
CREATE TABLE "Nutrition" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "energyKcal" INTEGER,
    "protein" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "saturatedFat" DOUBLE PRECISION,
    "carbohydrate" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "saltG" DOUBLE PRECISION,
    "basis" TEXT,
    "isEstimated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelEn" TEXT,
    "labelAr" TEXT,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuSchedule" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "categoryIds" TEXT[],

    CONSTRAINT "MenuSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

-- CreateIndex
CREATE INDEX "Category_restaurantId_idx" ON "Category"("restaurantId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "ItemAllergen_allergenId_idx" ON "ItemAllergen"("allergenId");

-- CreateIndex
CREATE UNIQUE INDEX "Nutrition_itemId_key" ON "Nutrition"("itemId");

-- CreateIndex
CREATE INDEX "Variant_itemId_idx" ON "Variant"("itemId");

-- CreateIndex
CREATE INDEX "MenuSchedule_restaurantId_idx" ON "MenuSchedule"("restaurantId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAllergen" ADD CONSTRAINT "ItemAllergen_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAllergen" ADD CONSTRAINT "ItemAllergen_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "Allergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutrition" ADD CONSTRAINT "Nutrition_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuSchedule" ADD CONSTRAINT "MenuSchedule_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
