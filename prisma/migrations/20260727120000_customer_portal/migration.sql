-- CreateEnum
CREATE TYPE "CustomerRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
CREATE TYPE "CustomerPlan" AS ENUM ('TRIAL', 'BASIC', 'PRO');
CREATE TYPE "AuditActorType" AS ENUM ('OPERATOR', 'CUSTOMER', 'SYSTEM');

-- AlterTable
ALTER TABLE "Restaurant"
ADD COLUMN "publishedSnapshot" JSONB,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "draftUpdatedAt" TIMESTAMP(3),
ADD COLUMN "customerAccountId" TEXT;

-- CreateTable
CREATE TABLE "CustomerAccount" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "plan" "CustomerPlan" NOT NULL DEFAULT 'TRIAL',
  "maxRestaurants" INTEGER NOT NULL DEFAULT 1,
  "maxStorageBytes" BIGINT NOT NULL DEFAULT 1073741824,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerUser" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "customerUserId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantMembership" (
  "id" TEXT NOT NULL,
  "customerUserId" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "role" "CustomerRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RestaurantMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerInvitation" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "CustomerRole" NOT NULL,
  "restaurantIds" TEXT[],
  "customerAccountId" TEXT NOT NULL,
  "invitedByCustomerUserId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerInvitation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT,
  "actorType" "AuditActorType" NOT NULL,
  "actorId" TEXT,
  "actorEmail" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "changes" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "operatorId" TEXT,
  "customerUserId" TEXT,
  "restaurantId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Restaurant_customerAccountId_idx" ON "Restaurant"("customerAccountId");
CREATE UNIQUE INDEX "CustomerUser_email_key" ON "CustomerUser"("email");
CREATE INDEX "CustomerUser_accountId_idx" ON "CustomerUser"("accountId");
CREATE UNIQUE INDEX "CustomerSession_tokenHash_key" ON "CustomerSession"("tokenHash");
CREATE INDEX "CustomerSession_customerUserId_idx" ON "CustomerSession"("customerUserId");
CREATE INDEX "CustomerSession_expiresAt_idx" ON "CustomerSession"("expiresAt");
CREATE UNIQUE INDEX "RestaurantMembership_customerUserId_restaurantId_key" ON "RestaurantMembership"("customerUserId", "restaurantId");
CREATE INDEX "RestaurantMembership_restaurantId_idx" ON "RestaurantMembership"("restaurantId");
CREATE UNIQUE INDEX "CustomerInvitation_tokenHash_key" ON "CustomerInvitation"("tokenHash");
CREATE INDEX "CustomerInvitation_customerAccountId_idx" ON "CustomerInvitation"("customerAccountId");
CREATE INDEX "CustomerInvitation_email_idx" ON "CustomerInvitation"("email");
CREATE INDEX "AuditLog_restaurantId_createdAt_idx" ON "AuditLog"("restaurantId", "createdAt");
CREATE INDEX "Notification_operatorId_createdAt_idx" ON "Notification"("operatorId", "createdAt");
CREATE INDEX "Notification_customerUserId_createdAt_idx" ON "Notification"("customerUserId", "createdAt");

-- Foreign keys
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_customerAccountId_fkey" FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerSession" ADD CONSTRAINT "CustomerSession_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RestaurantMembership" ADD CONSTRAINT "RestaurantMembership_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RestaurantMembership" ADD CONSTRAINT "RestaurantMembership_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerInvitation" ADD CONSTRAINT "CustomerInvitation_customerAccountId_fkey" FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerInvitation" ADD CONSTRAINT "CustomerInvitation_invitedByCustomerUserId_fkey" FOREIGN KEY ("invitedByCustomerUserId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
