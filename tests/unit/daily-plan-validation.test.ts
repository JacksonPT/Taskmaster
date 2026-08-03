import { describe, expect, it } from "vitest"

import {
  dailyPlanOutputSchema,
  validateReturnedTaskIds,
  type DailyPlanOutput,
  type DailyPlanTaskInput,
} from "@/lib/ai/daily-plan-validation"

const tasks: DailyPlanTaskInput[] = [
  {
    id: "first",
    title: "First",
    description: "One",
    priority: "High",
    dueDate: "",
  },
  {
    id: "second",
    title: "Second",
    description: "Two",
    priority: "Low",
    dueDate: "",
  },
]

function output(taskIds: string[]): DailyPlanOutput {
  return {
    summary: "Focus",
    items: taskIds.map((taskId) => ({ taskId, reason: `Do ${taskId}` })),
  }
}

describe("daily-plan output validation", () => {
  it("accepts every exact task ID once in a recommended order", () => {
    expect(() =>
      validateReturnedTaskIds(tasks, output(["second", "first"]))
    ).not.toThrow()
  })

  it("rejects omitted or duplicate task IDs", () => {
    expect(() => validateReturnedTaskIds(tasks, output(["first"]))).toThrow(
      "every active task"
    )
    expect(() =>
      validateReturnedTaskIds(tasks, output(["first", "first"]))
    ).toThrow("more than once")
  })

  it.each(["invented", " first", "FIRST"])(
    "rejects an unknown or altered ID %s",
    (taskId) => {
      expect(() =>
        validateReturnedTaskIds(tasks, output([taskId, "second"]))
      ).toThrow("unknown task id")
    }
  )

  it("normalizes text while preserving task IDs", () => {
    expect(
      dailyPlanOutputSchema.parse({
        summary: "  Focus  ",
        items: [{ taskId: " first ", reason: "  Start here  " }],
      })
    ).toEqual({
      summary: "Focus",
      items: [{ taskId: " first ", reason: "Start here" }],
    })
  })

  it("rejects empty, oversized, underfilled, and overfilled output", () => {
    expect(
      dailyPlanOutputSchema.safeParse({
        summary: "   ",
        items: output(["first"]).items,
      }).success
    ).toBe(false)
    expect(
      dailyPlanOutputSchema.safeParse({
        summary: "Focus",
        items: [{ taskId: "first", reason: "r".repeat(201) }],
      }).success
    ).toBe(false)
    expect(
      dailyPlanOutputSchema.safeParse({ summary: "Focus", items: [] }).success
    ).toBe(false)
    expect(
      dailyPlanOutputSchema.safeParse({
        summary: "Focus",
        items: Array.from({ length: 26 }, (_, index) => ({
          taskId: `task-${index}`,
          reason: "Reason",
        })),
      }).success
    ).toBe(false)
  })
})
