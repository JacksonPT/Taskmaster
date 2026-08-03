import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  task: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: mocks.task,
    dailyPlan: { findUnique: vi.fn() },
    dailyPlanUsage: { findUnique: vi.fn() },
  },
}))

import {
  createTask,
  deleteTask,
  getTasks,
  toggleTaskComplete,
  updateTask,
} from "@/app/tasks/actions"

const validInput = {
  title: "Plan release",
  description: "Confirm the checklist.",
  priority: "High" as const,
  priorityReason: "Deadline",
  dueDate: "2026-08-03",
}

function databaseTask(overrides: Record<string, unknown> = {}) {
  return {
    id: "task-1",
    userId: "user-a",
    title: "Plan release",
    description: "Confirm the checklist.",
    priority: "HIGH",
    priorityReason: "Deadline",
    status: "TODO",
    dueDate: new Date("2026-08-03T12:00:00"),
    completedAt: null,
    aiSuggestion: null,
    aiSteps: [],
    createdAt: new Date("2026-08-01T12:00:00.000Z"),
    updatedAt: new Date("2026-08-01T12:00:00.000Z"),
    ...overrides,
  }
}

describe("task Server Action boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.mockResolvedValue({ userId: "user-a" })
  })

  it("rejects signed-out mutations before private database access", async () => {
    mocks.auth.mockResolvedValue({ userId: null })

    await expect(createTask(validInput)).resolves.toMatchObject({
      success: false,
    })
    await expect(updateTask("task-1", validInput)).resolves.toMatchObject({
      success: false,
    })
    await expect(deleteTask("task-1")).resolves.toMatchObject({
      success: false,
    })
    await expect(toggleTaskComplete("task-1")).resolves.toMatchObject({
      success: false,
    })
    await expect(getTasks()).rejects.toThrow("signed in")

    expect(mocks.task.create).not.toHaveBeenCalled()
    expect(mocks.task.update).not.toHaveBeenCalled()
    expect(mocks.task.delete).not.toHaveBeenCalled()
    expect(mocks.task.findFirst).not.toHaveBeenCalled()
    expect(mocks.task.findMany).not.toHaveBeenCalled()
  })

  it("rejects malformed task input before persistence", async () => {
    const result = await createTask({ ...validInput, dueDate: "2026-02-30" })

    expect(result).toMatchObject({ success: false })
    expect(mocks.task.create).not.toHaveBeenCalled()
  })

  it("derives create ownership from Clerk and returns a safe task view", async () => {
    mocks.task.create.mockResolvedValue(databaseTask())

    const result = await createTask(validInput)

    expect(result).toMatchObject({
      success: true,
      task: { id: "task-1", priority: "High", status: "Todo" },
    })
    expect(mocks.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: "user-a", priority: "HIGH" }),
    })
  })

  it("scopes reads, edits, and deletes to the authenticated owner", async () => {
    mocks.task.findMany.mockResolvedValue([])
    mocks.task.update.mockResolvedValue(databaseTask({ title: "Updated" }))
    mocks.task.delete.mockResolvedValue(databaseTask())

    await getTasks()
    await updateTask("task-1", validInput)
    await deleteTask("task-1")

    expect(mocks.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-a" } })
    )
    expect(mocks.task.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "task-1", userId: "user-a" } })
    )
    expect(mocks.task.delete).toHaveBeenCalledWith({
      where: { id: "task-1", userId: "user-a" },
    })
  })

  it("derives complete and reopen transitions from owned database state", async () => {
    mocks.task.findFirst
      .mockResolvedValueOnce({ status: "TODO" })
      .mockResolvedValueOnce({ status: "DONE" })
    mocks.task.update
      .mockResolvedValueOnce(
        databaseTask({
          status: "DONE",
          completedAt: new Date("2026-08-03T12:00:00Z"),
        })
      )
      .mockResolvedValueOnce(
        databaseTask({ status: "TODO", completedAt: null })
      )

    await expect(toggleTaskComplete("task-1")).resolves.toMatchObject({
      success: true,
      task: { status: "Done" },
    })
    await expect(toggleTaskComplete("task-1")).resolves.toMatchObject({
      success: true,
      task: { status: "Todo" },
    })

    expect(mocks.task.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "task-1", userId: "user-a" } })
    )
    expect(mocks.task.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "task-1", userId: "user-a" },
        data: { status: "TODO", completedAt: null },
      })
    )
  })

  it("does not mutate when an owned task lookup finds nothing", async () => {
    mocks.task.findFirst.mockResolvedValue(null)

    await expect(toggleTaskComplete("foreign-task")).resolves.toMatchObject({
      success: false,
    })
    expect(mocks.task.update).not.toHaveBeenCalled()
  })

  it("returns a bounded persistence failure without leaking database details", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    mocks.task.delete.mockRejectedValue(
      new Error("postgres://secret-host private query detail")
    )

    const result = await deleteTask("task-1")

    expect(result).toEqual({
      success: false,
      message: "Could not delete the task. Try again.",
    })
    expect(JSON.stringify(result)).not.toMatch(/secret-host|query detail/)
    consoleError.mockRestore()
  })
})
