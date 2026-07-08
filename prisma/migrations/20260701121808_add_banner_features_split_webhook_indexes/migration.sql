/*
  Warnings:

  - You are about to drop the column `qrispayApiKey` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BotType" ADD COLUMN     "featuresBasic" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "featuresPremium" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "qrispayApiKey",
ADD COLUMN     "bannerEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "bannerLink" TEXT;

-- CreateTable
CREATE TABLE "ProcessedWebhook" (
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhook_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE INDEX "ProcessedWebhook_createdAt_idx" ON "ProcessedWebhook"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");

-- CreateIndex
CREATE INDEX "Rental_expiresAt_idx" ON "Rental"("expiresAt");

-- CreateIndex
CREATE INDEX "Rental_botTypeId_idx" ON "Rental"("botTypeId");
