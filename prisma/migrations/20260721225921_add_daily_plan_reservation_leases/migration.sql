/*
  Warnings:

  - You are about to drop the column `pendingCount` on the `DailyPlanUsage` table. All the data in the column will be lost.
  - You are about to drop the column `pendingSince` on the `DailyPlanUsage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyPlanUsage" DROP COLUMN "pendingCount",
DROP COLUMN "pendingSince";

-- CreateTable
CREATE TABLE "DailyPlanReservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usageDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPlanReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyPlanReservation_userId_usageDate_idx" ON "DailyPlanReservation"("userId", "usageDate");
