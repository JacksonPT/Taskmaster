import { describe, expect, it } from "vitest"

import {
  parseTaskDueDate,
  taskFormInputSchema,
  taskIdSchema,
} from "@/lib/tasks/task-input"

const validInput = {
  title: "Plan release",
  description: "Confirm the final checklist.",
  priority: "High",
  priorityReason: "Deadline",
  dueDate: "2026-08-03",
}

describe("task input validation", () => {
  it("normalizes bounded task strings", () => {
    expect(
      taskFormInputSchema.parse({
        ...validInput,
        title: "  Plan release  ",
        description: "  Confirm the final checklist.  ",
        priorityReason: "  Deadline  ",
        dueDate: " 2026-08-03 ",
      })
    ).toEqual(validInput)
  })

  it.each([
    ["empty title", { title: "" }],
    ["whitespace description", { description: "   " }],
    ["long title", { title: "t".repeat(121) }],
    ["long description", { description: "d".repeat(1001) }],
    ["unknown priority", { priority: "Urgent" }],
    ["long explanation", { priorityReason: "r".repeat(241) }],
    ["malformed date", { dueDate: "08/03/2026" }],
    ["impossible date", { dueDate: "2026-02-30" }],
  ])("rejects %s", (_label, override) => {
    expect(
      taskFormInputSchema.safeParse({ ...validInput, ...override }).success
    ).toBe(false)
  })

  it("accepts empty optional values and parses due dates consistently", () => {
    expect(
      taskFormInputSchema.parse({
        ...validInput,
        priorityReason: "",
        dueDate: "",
      })
    ).toMatchObject({ priorityReason: "", dueDate: "" })
    expect(parseTaskDueDate("")).toBeNull()
    expect(parseTaskDueDate("2026-08-03")).toEqual(
      new Date("2026-08-03T12:00:00")
    )
  })

  it.each(["", "   ", "i".repeat(101), 42, null])(
    "rejects invalid direct identifier %j",
    (value) => {
      expect(taskIdSchema.safeParse(value).success).toBe(false)
    }
  )
})
