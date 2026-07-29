-- AlterTable
ALTER TABLE "DailyPlanUsage" ADD COLUMN     "pendingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingSince" TIMESTAMP(3);
