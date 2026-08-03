import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { reorderDailyPlanForUser } from "@/lib/daily-plan-persistence"

import { cleanTestDatabase, createTestPrismaClient } from "./prisma"

const prisma = createTestPrismaClient()

async function createPlan() {
  const [first, second] = await Promise.all([
    prisma.task.create({
      data: { title: "First", description: "One", userId: "user-a" },
    }),
    prisma.task.create({
      data: { title: "Second", description: "Two", userId: "user-a" },
    }),
  ])
  const plan = await prisma.dailyPlan.create({
    data: {
      userId: "user-a",
      summary: "Focus",
      planDate: "2026-08-03",
      items: {
        create: [
          { taskId: first.id, position: 1, reason: "First reason" },
          { taskId: second.id, position: 2, reason: "Second reason" },
        ],
      },
    },
    include: { items: { orderBy: { position: "asc" } } },
  })

  return { plan, first, second }
}

describe("daily-plan reorder persistence", () => {
  beforeAll(() => cleanTestDatabase(prisma))
  beforeEach(() => cleanTestDatabase(prisma))
  afterAll(async () => {
    await cleanTestDatabase(prisma)
    await prisma.$disconnect()
  })

  it("persists the complete owned order while preserving stored reasons", async () => {
    const { first, second } = await createPlan()

    const result = await reorderDailyPlanForUser(
      "user-a",
      [second.id, first.id],
      { database: prisma, claimedAt: new Date("2026-08-03T13:00:00.000Z") }
    )

    expect(result).toEqual({
      status: "success",
      items: [
        { taskId: second.id, position: 1, reason: "Second reason" },
        { taskId: first.id, position: 2, reason: "First reason" },
      ],
    })
    await expect(prisma.dailyPlanUsage.count()).resolves.toBe(0)
    await expect(prisma.dailyPlanReservation.count()).resolves.toBe(0)
  })

  it("rejects foreign ownership and an inexact task ID set", async () => {
    const { first } = await createPlan()

    await expect(
      reorderDailyPlanForUser("user-b", [first.id], { database: prisma })
    ).resolves.toEqual({ status: "missing" })
    await expect(
      reorderDailyPlanForUser("user-a", [first.id], { database: prisma })
    ).resolves.toEqual({ status: "changed" })
  })

  it("rejects a reorder when regeneration changes the loaded plan version", async () => {
    const { plan, first, second } = await createPlan()

    const result = await reorderDailyPlanForUser(
      "user-a",
      [second.id, first.id],
      {
        database: prisma,
        afterPlanLoaded: async () => {
          await prisma.dailyPlan.update({
            where: { id: plan.id },
            data: { summary: "Regenerated" },
          })
        },
      }
    )

    expect(result).toEqual({ status: "changed" })
    const items = await prisma.dailyPlanItem.findMany({
      where: { dailyPlanId: plan.id },
      orderBy: { position: "asc" },
    })
    expect(items.map(({ taskId }) => taskId)).toEqual([first.id, second.id])
  })
})
