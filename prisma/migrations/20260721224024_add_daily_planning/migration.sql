-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "planDate" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlanItem" (
    "id" TEXT NOT NULL,
    "dailyPlanId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DailyPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlanUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usageDate" TEXT NOT NULL,
    "generationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlanUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_userId_key" ON "DailyPlan"("userId");

-- CreateIndex
CREATE INDEX "DailyPlanItem_taskId_idx" ON "DailyPlanItem"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlanItem_dailyPlanId_taskId_key" ON "DailyPlanItem"("dailyPlanId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlanItem_dailyPlanId_position_key" ON "DailyPlanItem"("dailyPlanId", "position");

-- CreateIndex
CREATE INDEX "DailyPlanUsage_userId_idx" ON "DailyPlanUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlanUsage_userId_usageDate_key" ON "DailyPlanUsage"("userId", "usageDate");

-- AddForeignKey
ALTER TABLE "DailyPlanItem" ADD CONSTRAINT "DailyPlanItem_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlanItem" ADD CONSTRAINT "DailyPlanItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
