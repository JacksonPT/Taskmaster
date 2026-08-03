import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { cleanTestDatabase, createTestPrismaClient } from "./prisma"

const prisma = createTestPrismaClient()

describe("PostgreSQL application invariants", () => {
  beforeAll(() => cleanTestDatabase(prisma))
  beforeEach(() => cleanTestDatabase(prisma))
  afterAll(async () => {
    await cleanTestDatabase(prisma)
    await prisma.$disconnect()
  })

  it("isolates owned tasks and excludes null-owned legacy rows", async () => {
    await prisma.task.createMany({
      data: [
        { title: "A", description: "Owned by A", userId: "user-a" },
        { title: "B", description: "Owned by B", userId: "user-b" },
        { title: "Legacy", description: "No owner", userId: null },
      ],
    })

    const owned = await prisma.task.findMany({ where: { userId: "user-a" } })

    expect(owned.map(({ title }) => title)).toEqual(["A"])
  })

  it("enforces plan uniqueness and cascades deleted task items", async () => {
    const firstTask = await prisma.task.create({
      data: { title: "First", description: "One", userId: "user-a" },
    })
    const secondTask = await prisma.task.create({
      data: { title: "Second", description: "Two", userId: "user-a" },
    })
    const plan = await prisma.dailyPlan.create({
      data: {
        userId: "user-a",
        summary: "Focus",
        planDate: "2026-08-03",
      },
    })
    await prisma.dailyPlanItem.create({
      data: {
        dailyPlanId: plan.id,
        taskId: firstTask.id,
        position: 1,
        reason: "First",
      },
    })

    await expect(
      prisma.dailyPlanItem.create({
        data: {
          dailyPlanId: plan.id,
          taskId: secondTask.id,
          position: 1,
          reason: "Duplicate position",
        },
      })
    ).rejects.toThrow()

    await prisma.task.delete({ where: { id: firstTask.id } })
    await expect(
      prisma.dailyPlanItem.count({ where: { dailyPlanId: plan.id } })
    ).resolves.toBe(0)
  })

  it("persists trusted complete and reopen timestamp transitions", async () => {
    const task = await prisma.task.create({
      data: { title: "Task", description: "Details", userId: "user-a" },
    })
    const completedAt = new Date("2026-08-03T12:00:00.000Z")

    const completed = await prisma.task.update({
      where: { id: task.id, userId: "user-a" },
      data: { status: "DONE", completedAt },
    })
    const reopened = await prisma.task.update({
      where: { id: task.id, userId: "user-a" },
      data: { status: "TODO", completedAt: null },
    })

    expect(completed).toMatchObject({ status: "DONE", completedAt })
    expect(reopened).toMatchObject({ status: "TODO", completedAt: null })
  })

  it("rolls back every write when a transaction fails", async () => {
    await expect(
      prisma.$transaction(async (transaction) => {
        await transaction.task.create({
          data: {
            title: "Rolled back",
            description: "Details",
            userId: "user-a",
          },
        })
        throw new Error("force rollback")
      })
    ).rejects.toThrow("force rollback")

    await expect(prisma.task.count()).resolves.toBe(0)
  })
})
