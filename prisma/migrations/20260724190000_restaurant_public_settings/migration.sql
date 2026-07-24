ALTER TABLE "Restaurant"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "whatsappNumber" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "kdvNoticeEn" TEXT,
  ADD COLUMN "kdvNoticeAr" TEXT,
  ADD COLUMN "establishedYear" INTEGER,
  ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'TRY',
  ADD COLUMN "attributionText" TEXT,
  ADD COLUMN "attributionUrl" TEXT;
