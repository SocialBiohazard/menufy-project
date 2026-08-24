-- Preserve every existing food portion while generalizing portions for drinks.
CREATE TYPE "PortionUnit" AS ENUM ('G', 'ML', 'L');

ALTER TABLE "Item" RENAME COLUMN "portionGrams" TO "portionAmount";
ALTER TABLE "Item" ALTER COLUMN "portionAmount" TYPE DOUBLE PRECISION;
ALTER TABLE "Item" ADD COLUMN "portionUnit" "PortionUnit";

UPDATE "Item"
SET "portionUnit" = 'G'
WHERE "portionAmount" IS NOT NULL;
