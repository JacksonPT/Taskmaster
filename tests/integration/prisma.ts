import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/lib/generated/prisma/client"

import { getTestDatabaseUrl } from "./environment.mjs"

// Integration clients require the dedicated variable and can never inherit the
// application database URL by accident.
export function createTestPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getTestDatabaseUrl() })
  return new PrismaClient({ adapter })
}

export async function cleanTestDatabase(
  prisma: ReturnType<typeof createTestPrismaClient>
) {
  await prisma.dailyPlanReservation.deleteMany()
  await prisma.dailyPlanUsage.deleteMany()
  await prisma.dailyPlanItem.deleteMany()
  await prisma.dailyPlan.deleteMany()
  await prisma.task.deleteMany()
}
