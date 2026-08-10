ALTER TABLE "Restaurant"
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  ADD COLUMN "facebookUrl" TEXT,
  ADD COLUMN "xUrl" TEXT,
  ADD COLUMN "youtubeUrl" TEXT,
  ADD COLUMN "kdvNoticeRu" TEXT,
  ADD COLUMN "allergenNoticeRu" TEXT,
  ADD COLUMN "nutritionNoticeRu" TEXT,
  ADD COLUMN "sloganRu" TEXT,
  ADD COLUMN "footerDescription" TEXT,
  ADD COLUMN "footerDescriptionEn" TEXT,
  ADD COLUMN "footerDescriptionAr" TEXT,
  ADD COLUMN "footerDescriptionRu" TEXT,
  ADD COLUMN "footerCopyright" TEXT,
  ADD COLUMN "footerVisibility" JSONB;

ALTER TABLE "Category" ADD COLUMN "nameRu" TEXT;

ALTER TABLE "Item"
  ADD COLUMN "nameRu" TEXT,
  ADD COLUMN "descriptionRu" TEXT;

ALTER TABLE "Allergen" ADD COLUMN "nameRu" TEXT;

UPDATE "Allergen" SET "nameRu" = CASE "id"
  WHEN 1 THEN 'Злаки, содержащие глютен'
  WHEN 2 THEN 'Ракообразные'
  WHEN 3 THEN 'Яйца'
  WHEN 4 THEN 'Рыба'
  WHEN 5 THEN 'Арахис'
  WHEN 6 THEN 'Соя'
  WHEN 7 THEN 'Молоко'
  WHEN 8 THEN 'Орехи'
  WHEN 9 THEN 'Сельдерей'
  WHEN 10 THEN 'Горчица'
  WHEN 11 THEN 'Кунжут'
  WHEN 12 THEN 'Диоксид серы и сульфиты'
  WHEN 13 THEN 'Люпин'
  WHEN 14 THEN 'Моллюски'
  ELSE "nameRu"
END;

ALTER TABLE "Variant" ADD COLUMN "labelRu" TEXT;
