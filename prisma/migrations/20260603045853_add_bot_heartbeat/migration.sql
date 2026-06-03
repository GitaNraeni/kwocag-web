-- CreateTable
CREATE TABLE "BotHeartbeat" (
    "id" TEXT NOT NULL,
    "instance" INTEGER NOT NULL,
    "botTypeSlug" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotHeartbeat_pkey" PRIMARY KEY ("id")
);
