-- Customer launch fields required by the İnci template and custom hostname.
ALTER TABLE "Restaurant"
  ADD COLUMN "allergenNotice" TEXT,
  ADD COLUMN "allergenNoticeEn" TEXT,
  ADD COLUMN "allergenNoticeAr" TEXT,
  ADD COLUMN "nutritionNotice" TEXT,
  ADD COLUMN "nutritionNoticeEn" TEXT,
  ADD COLUMN "nutritionNoticeAr" TEXT,
  ADD COLUMN "splashImage" TEXT,
  ADD COLUMN "splashEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicHostname" TEXT,
  ADD COLUMN "lastPriceChangeAt" TIMESTAMP(3);

ALTER TABLE "Item" ADD COLUMN "portionGrams" INTEGER;

CREATE UNIQUE INDEX "Restaurant_publicHostname_key" ON "Restaurant"("publicHostname");
