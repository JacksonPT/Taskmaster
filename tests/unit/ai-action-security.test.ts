import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  generateCompletionPlan: vi.fn(),
  generateDailyPlan: vi.fn(),
  generatePrioritySuggestion: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: {
    $transaction: vi.fn(),
    dailyPlan: { findUnique: vi.fn() },
    dailyPlanReservation: { deleteMany: vi.fn() },
    dailyPlanUsage: { upsert: vi.fn() },
    task: { findFirst: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
  },
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }))
vi.mock("@/lib/ai/task-completion", () => ({
  generateCompletionPlan: mocks.generateCompletionPlan,
}))
vi.mock("@/lib/ai/task-priority", () => ({
  generatePrioritySuggestion: mocks.generatePrioritySuggestion,
}))
vi.mock("@/lib/ai/daily-plan", () => ({
  generateDailyPlan: mocks.generateDailyPlan,
}))

import {
  createDailyPlan,
  createTaskCompletionPlan,
  reorderDailyPlan,
  suggestTaskPriority,
} from "@/app/tasks/ai-actions"

describe("AI Server Action security boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    mocks.auth.mockResolvedValue({ userId: null })
  })

  it("stops signed-out AI and planning calls before private I/O or providers", async () => {
    await expect(
      suggestTaskPriority({
        title: "Task",
        description: "Details",
        dueDate: "",
      })
    ).resolves.toMatchObject({ success: false })
    await expect(createTaskCompletionPlan("task-1")).resolves.toMatchObject({
      success: false,
    })
    await expect(createDailyPlan()).resolves.toMatchObject({ success: false })
    await expect(reorderDailyPlan(["task-1"])).resolves.toMatchObject({
      success: false,
    })

    expect(mocks.prisma.task.findFirst).not.toHaveBeenCalled()
    expect(mocks.prisma.task.findMany).not.toHaveBeenCalled()
    expect(mocks.prisma.dailyPlan.findUnique).not.toHaveBeenCalled()
    expect(mocks.generatePrioritySuggestion).not.toHaveBeenCalled()
    expect(mocks.generateCompletionPlan).not.toHaveBeenCalled()
    expect(mocks.generateDailyPlan).not.toHaveBeenCalled()
  })

  it("does not send a foreign or missing task to Gemini", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.prisma.task.findFirst.mockResolvedValue(null)

    const result = await createTaskCompletionPlan("user-b-task")

    expect(result).toMatchObject({ success: false })
    expect(mocks.prisma.task.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "user-b-task", userId: "user-a" }),
      })
    )
    expect(mocks.generateCompletionPlan).not.toHaveBeenCalled()
    expect(mocks.prisma.task.updateMany).not.toHaveBeenCalled()
  })

  it("returns a stable configuration failure before priority generation", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-a" })

    const result = await suggestTaskPriority({
      title: "Task",
      description: "Details",
      dueDate: "",
    })

    expect(result).toEqual({
      success: false,
      message: "Gemini suggestions are not configured yet.",
    })
    expect(mocks.generatePrioritySuggestion).not.toHaveBeenCalled()
  })

  it("returns a controlled priority suggestion", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.generatePrioritySuggestion.mockResolvedValue({
      priority: "High",
      explanation: "Deadline",
    })

    await expect(
      suggestTaskPriority({
        title: "Task",
        description: "Details",
        dueDate: "",
      })
    ).resolves.toEqual({
      success: true,
      suggestion: { priority: "High", explanation: "Deadline" },
    })
  })

  it.each(["provider rejection", "timeout", "rate limit"])(
    "hides controlled priority %s details",
    async (detail) => {
      vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
      mocks.auth.mockResolvedValue({ userId: "user-a" })
      mocks.generatePrioritySuggestion.mockRejectedValue(new Error(detail))
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const result = await suggestTaskPriority({
        title: "Task",
        description: "Details",
        dueDate: "",
      })

      expect(result).toEqual({
        success: false,
        message: "Could not generate a priority suggestion. Try again shortly.",
      })
      expect(JSON.stringify(result)).not.toContain(detail)
      consoleError.mockRestore()
    }
  )

  it("persists a controlled completion plan only for the unchanged owned task", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.prisma.task.findFirst.mockResolvedValue({
      id: "task-1",
      title: "Task",
      description: "Details",
      priority: "HIGH",
      dueDate: null,
      status: "TODO",
      updatedAt: new Date("2026-08-03T12:00:00.000Z"),
    })
    mocks.generateCompletionPlan.mockResolvedValue({
      summary: "Plan",
      steps: ["First", "Second"],
    })
    mocks.prisma.task.updateMany.mockResolvedValue({ count: 1 })

    await expect(createTaskCompletionPlan("task-1")).resolves.toMatchObject({
      success: true,
      plan: { summary: "Plan" },
    })
    expect(mocks.prisma.task.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "task-1",
          userId: "user-a",
          status: { not: "DONE" },
        }),
      })
    )
  })

  it("preserves guidance when completion generation or persistence fails", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.prisma.task.findFirst.mockResolvedValue({
      id: "task-1",
      title: "Task",
      description: "Details",
      priority: "HIGH",
      dueDate: null,
      status: "TODO",
      updatedAt: new Date("2026-08-03T12:00:00.000Z"),
    })
    mocks.generateCompletionPlan.mockRejectedValueOnce(
      new Error("provider secret")
    )
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    await expect(createTaskCompletionPlan("task-1")).resolves.toMatchObject({
      success: false,
    })
    expect(mocks.prisma.task.updateMany).not.toHaveBeenCalled()

    mocks.generateCompletionPlan.mockResolvedValue({
      summary: "Plan",
      steps: ["First", "Second"],
    })
    mocks.prisma.task.updateMany.mockRejectedValue(
      new Error("database query detail")
    )

    const result = await createTaskCompletionPlan("task-1")
    expect(result).toMatchObject({ success: false })
    expect(JSON.stringify(result)).not.toMatch(/provider secret|query detail/)
    consoleError.mockRestore()
  })

  it("discards stale output when the task changes or is deleted", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.prisma.task.findFirst.mockResolvedValue({
      id: "task-1",
      title: "Task",
      description: "Details",
      priority: "HIGH",
      dueDate: null,
      status: "TODO",
      updatedAt: new Date("2026-08-03T12:00:00.000Z"),
    })
    mocks.generateCompletionPlan.mockResolvedValue({
      summary: "Plan",
      steps: ["First", "Second"],
    })
    mocks.prisma.task.updateMany.mockResolvedValue({ count: 0 })

    await expect(createTaskCompletionPlan("task-1")).resolves.toEqual({
      success: false,
      message: "This task changed while Gemini was responding. Try again.",
    })
  })

  it("returns safe planning lookup failures before provider or quota work", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "controlled-test-key")
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.prisma.task.findMany.mockRejectedValue(
      new Error("private task query")
    )
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await createDailyPlan()

    expect(result).toEqual({
      success: false,
      message: "Could not load tasks for daily planning. Try again shortly.",
    })
    expect(mocks.generateDailyPlan).not.toHaveBeenCalled()
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("returns safe reorder lookup failures without provider or quota work", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-a" })
    mocks.prisma.dailyPlan.findUnique.mockRejectedValue(
      new Error("private plan query")
    )
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await reorderDailyPlan(["task-1"])

    expect(result).toEqual({
      success: false,
      message: "Could not save the new task order. Try again shortly.",
    })
    expect(mocks.generateDailyPlan).not.toHaveBeenCalled()
    expect(mocks.prisma.dailyPlanUsage.upsert).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
