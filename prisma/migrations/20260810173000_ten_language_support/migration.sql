ALTER TABLE "Restaurant"
  ADD COLUMN "kdvNoticeDe" TEXT,
  ADD COLUMN "kdvNoticeFr" TEXT,
  ADD COLUMN "kdvNoticeEs" TEXT,
  ADD COLUMN "kdvNoticeIt" TEXT,
  ADD COLUMN "kdvNoticePl" TEXT,
  ADD COLUMN "kdvNoticeZh" TEXT,
  ADD COLUMN "allergenNoticeDe" TEXT,
  ADD COLUMN "allergenNoticeFr" TEXT,
  ADD COLUMN "allergenNoticeEs" TEXT,
  ADD COLUMN "allergenNoticeIt" TEXT,
  ADD COLUMN "allergenNoticePl" TEXT,
  ADD COLUMN "allergenNoticeZh" TEXT,
  ADD COLUMN "nutritionNoticeDe" TEXT,
  ADD COLUMN "nutritionNoticeFr" TEXT,
  ADD COLUMN "nutritionNoticeEs" TEXT,
  ADD COLUMN "nutritionNoticeIt" TEXT,
  ADD COLUMN "nutritionNoticePl" TEXT,
  ADD COLUMN "nutritionNoticeZh" TEXT,
  ADD COLUMN "sloganDe" TEXT,
  ADD COLUMN "sloganFr" TEXT,
  ADD COLUMN "sloganEs" TEXT,
  ADD COLUMN "sloganIt" TEXT,
  ADD COLUMN "sloganPl" TEXT,
  ADD COLUMN "sloganZh" TEXT,
  ADD COLUMN "footerDescriptionDe" TEXT,
  ADD COLUMN "footerDescriptionFr" TEXT,
  ADD COLUMN "footerDescriptionEs" TEXT,
  ADD COLUMN "footerDescriptionIt" TEXT,
  ADD COLUMN "footerDescriptionPl" TEXT,
  ADD COLUMN "footerDescriptionZh" TEXT;

ALTER TABLE "Category"
  ADD COLUMN "nameDe" TEXT,
  ADD COLUMN "nameFr" TEXT,
  ADD COLUMN "nameEs" TEXT,
  ADD COLUMN "nameIt" TEXT,
  ADD COLUMN "namePl" TEXT,
  ADD COLUMN "nameZh" TEXT;

ALTER TABLE "Item"
  ADD COLUMN "nameDe" TEXT,
  ADD COLUMN "nameFr" TEXT,
  ADD COLUMN "nameEs" TEXT,
  ADD COLUMN "nameIt" TEXT,
  ADD COLUMN "namePl" TEXT,
  ADD COLUMN "nameZh" TEXT,
  ADD COLUMN "descriptionDe" TEXT,
  ADD COLUMN "descriptionFr" TEXT,
  ADD COLUMN "descriptionEs" TEXT,
  ADD COLUMN "descriptionIt" TEXT,
  ADD COLUMN "descriptionPl" TEXT,
  ADD COLUMN "descriptionZh" TEXT;

ALTER TABLE "Allergen"
  ADD COLUMN "nameDe" TEXT,
  ADD COLUMN "nameFr" TEXT,
  ADD COLUMN "nameEs" TEXT,
  ADD COLUMN "nameIt" TEXT,
  ADD COLUMN "namePl" TEXT,
  ADD COLUMN "nameZh" TEXT;

ALTER TABLE "Variant"
  ADD COLUMN "labelDe" TEXT,
  ADD COLUMN "labelFr" TEXT,
  ADD COLUMN "labelEs" TEXT,
  ADD COLUMN "labelIt" TEXT,
  ADD COLUMN "labelPl" TEXT,
  ADD COLUMN "labelZh" TEXT;
