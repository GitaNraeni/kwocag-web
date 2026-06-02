-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'SUCCESS', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "RentalSource" AS ENUM ('MANUAL', 'BOT', 'WEBSITE');

-- CreateTable
CREATE TABLE "BotType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxSlots" INTEGER NOT NULL DEFAULT 0,
    "totalInstances" INTEGER NOT NULL DEFAULT 1,
    "acceptingOrders" BOOLEAN NOT NULL DEFAULT true,
    "hasPremiumTier" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "botTypeId" TEXT NOT NULL,
    "duration" "Duration" NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'basic',
    "customDays" INTEGER,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "botTypeId" TEXT NOT NULL,
    "botInstance" INTEGER NOT NULL DEFAULT 1,
    "duration" "Duration" NOT NULL,
    "customDays" INTEGER,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "groupLink" TEXT NOT NULL,
    "contactPhone" TEXT,
    "normalizedPhone" TEXT,
    "contactEmail" TEXT,
    "totalPrice" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "paymentUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "rentalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "groupName" TEXT,
    "groupLink" TEXT,
    "botTypeId" TEXT NOT NULL,
    "botInstance" INTEGER NOT NULL DEFAULT 1,
    "status" "RentalStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "RentalSource" NOT NULL DEFAULT 'MANUAL',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "siteName" TEXT NOT NULL DEFAULT 'KWOCAG',
    "siteLogo" TEXT,
    "pakasirApiKey" TEXT,
    "pakasirSlug" TEXT,
    "telegramToken" TEXT,
    "telegramChatId" TEXT,
    "telegramLogChatId" TEXT,
    "contactWhatsapp" TEXT,
    "contactTelegram" TEXT,
    "channelWhatsapp" TEXT,
    "paymentProvider" TEXT NOT NULL DEFAULT 'pakasir',
    "ramashopApiKey" TEXT,
    "qrispayApiKey" TEXT,
    "adminFee" INTEGER NOT NULL DEFAULT 0,
    "adminFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maintenance" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMsg" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotType_slug_key" ON "BotType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Price_botTypeId_duration_tier_key" ON "Price"("botTypeId", "duration", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

-- CreateIndex
CREATE UNIQUE INDEX "Rental_groupId_botTypeId_key" ON "Rental"("groupId", "botTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_botTypeId_fkey" FOREIGN KEY ("botTypeId") REFERENCES "BotType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_botTypeId_fkey" FOREIGN KEY ("botTypeId") REFERENCES "BotType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_botTypeId_fkey" FOREIGN KEY ("botTypeId") REFERENCES "BotType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLog" ADD CONSTRAINT "OrderLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
