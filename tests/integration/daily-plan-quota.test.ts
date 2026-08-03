import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import {
  commitDailyPlanGeneration,
  DAILY_PLAN_RESERVATION_TTL_MS,
  releaseDailyPlanReservation,
  reserveDailyPlanGeneration,
} from "@/lib/daily-plan-persistence"

import { cleanTestDatabase, createTestPrismaClient } from "./prisma"

const prisma = createTestPrismaClient()
const usageDate = "2026-08-03"

describe("daily-plan quota persistence", () => {
  beforeAll(() => cleanTestDatabase(prisma))
  beforeEach(() => cleanTestDatabase(prisma))
  afterAll(async () => {
    await cleanTestDatabase(prisma)
    await prisma.$disconnect()
  })

  it("allows only one concurrent request to claim the final slot", async () => {
    await prisma.dailyPlanUsage.create({
      data: { userId: "user-a", usageDate, generationCount: 1 },
    })
    const now = new Date()

    const results = await Promise.all([
      reserveDailyPlanGeneration("user-a", usageDate, prisma, now),
      reserveDailyPlanGeneration("user-a", usageDate, prisma, now),
    ])

    expect(
      results.filter(({ reservationId }) => reservationId !== null)
    ).toHaveLength(1)
    await expect(
      prisma.dailyPlanReservation.count({
        where: { userId: "user-a", usageDate },
      })
    ).resolves.toBe(1)
  })

  it("increments successful use only when the full plan transaction commits", async () => {
    const task = await prisma.task.create({
      data: { title: "Task", description: "Details", userId: "user-a" },
    })
    const reservation = await reserveDailyPlanGeneration(
      "user-a",
      usageDate,
      prisma,
      new Date("2026-08-03T12:00:00.000Z")
    )

    const result = await commitDailyPlanGeneration(
      {
        userId: "user-a",
        usageDate,
        reservationId: reservation.reservationId!,
        output: {
          summary: "Focus",
          items: [{ taskId: task.id, reason: "First" }],
        },
        generatedAt: new Date("2026-08-03T12:01:00.000Z"),
      },
      prisma
    )

    expect(result.generationsUsedToday).toBe(1)
    await expect(
      prisma.dailyPlanReservation.count({
        where: { userId: "user-a", usageDate },
      })
    ).resolves.toBe(0)
    await expect(
      prisma.dailyPlanItem.count({ where: { dailyPlanId: result.plan.id } })
    ).resolves.toBe(1)
  })

  it("rolls back plan and usage when persistence fails", async () => {
    const reservation = await reserveDailyPlanGeneration(
      "user-a",
      usageDate,
      prisma,
      new Date("2026-08-03T12:00:00.000Z")
    )

    await expect(
      commitDailyPlanGeneration(
        {
          userId: "user-a",
          usageDate,
          reservationId: reservation.reservationId!,
          output: {
            summary: "Invalid foreign key",
            items: [{ taskId: "missing-task", reason: "Cannot persist" }],
          },
          generatedAt: new Date("2026-08-03T12:01:00.000Z"),
        },
        prisma
      )
    ).rejects.toThrow()

    await expect(
      prisma.dailyPlanUsage.findUnique({
        where: { userId_usageDate: { userId: "user-a", usageDate } },
      })
    ).resolves.toMatchObject({ generationCount: 0 })
    await expect(prisma.dailyPlan.count()).resolves.toBe(0)
    await expect(
      prisma.dailyPlanReservation.count({
        where: { userId: "user-a", usageDate },
      })
    ).resolves.toBe(1)
  })

  it("releases only the failed request reservation without changing usage", async () => {
    const first = await reserveDailyPlanGeneration("user-a", usageDate, prisma)
    const second = await reserveDailyPlanGeneration("user-a", usageDate, prisma)

    await releaseDailyPlanReservation(
      first.reservationId!,
      "user-a",
      usageDate,
      prisma
    )

    await expect(
      prisma.dailyPlanReservation.findMany({
        where: { userId: "user-a", usageDate },
        select: { id: true },
      })
    ).resolves.toEqual([{ id: second.reservationId }])
    await expect(
      prisma.dailyPlanUsage.findUnique({
        where: { userId_usageDate: { userId: "user-a", usageDate } },
      })
    ).resolves.toMatchObject({ generationCount: 0 })
  })

  it("expires abandoned leases without deleting a newer reservation", async () => {
    const now = new Date("2026-08-03T12:00:00.000Z")
    await prisma.dailyPlanUsage.create({
      data: { userId: "user-a", usageDate },
    })
    const stale = await prisma.dailyPlanReservation.create({
      data: {
        userId: "user-a",
        usageDate,
        createdAt: new Date(now.getTime() - DAILY_PLAN_RESERVATION_TTL_MS - 1),
      },
    })
    const fresh = await prisma.dailyPlanReservation.create({
      data: {
        userId: "user-a",
        usageDate,
        createdAt: new Date(now.getTime() - 60_000),
      },
    })

    const next = await reserveDailyPlanGeneration(
      "user-a",
      usageDate,
      prisma,
      now
    )
    const remaining = await prisma.dailyPlanReservation.findMany({
      where: { userId: "user-a", usageDate },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    })

    expect(remaining.map(({ id }) => id)).not.toContain(stale.id)
    expect(remaining.map(({ id }) => id)).toEqual(
      expect.arrayContaining([fresh.id, next.reservationId])
    )
  })
})
