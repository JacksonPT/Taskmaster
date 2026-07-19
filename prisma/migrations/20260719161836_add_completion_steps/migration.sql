-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "aiSteps" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Module 6 populated this field with deterministic placeholder copy.
-- Clear only that pre-AI field so Module 10 starts with honest empty plans.
UPDATE "Task" SET "aiSuggestion" = NULL;
