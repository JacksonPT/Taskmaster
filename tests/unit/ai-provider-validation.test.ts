import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  generateCompletionPlan,
  type CompletionPlanInput,
} from "@/lib/ai/task-completion"
import {
  generatePrioritySuggestion,
  type PrioritySuggestionInput,
} from "@/lib/ai/task-priority"

const priorityInput: PrioritySuggestionInput = {
  title: "Plan release",
  description: "Confirm the checklist.",
  dueDate: "2026-08-03",
}

const completionInput: CompletionPlanInput = {
  title: "Plan release",
  description: "Confirm the checklist.",
  priority: "HIGH",
  dueDate: "2026-08-03",
}

describe("controlled priority provider output", () => {
  it("returns normalized valid structured output", async () => {
    await expect(
      generatePrioritySuggestion(priorityInput, async () => ({
        output: { priority: "High", explanation: "  Deadline is close.  " },
      }))
    ).resolves.toEqual({
      priority: "High",
      explanation: "Deadline is close.",
    })
  })

  it.each([
    { priority: "Urgent", explanation: "Reason" },
    { priority: "High", explanation: "   " },
    { priority: "High", explanation: "r".repeat(241) },
  ])("rejects malformed priority output %#", async (output) => {
    await expect(
      generatePrioritySuggestion(priorityInput, async () => ({ output }))
    ).rejects.toThrow()
  })

  it.each(["provider rejection", "timeout", "rate limit"])(
    "propagates controlled %s failures to the action boundary",
    async (message) => {
      await expect(
        generatePrioritySuggestion(priorityInput, async () => {
          throw new Error(message)
        })
      ).rejects.toThrow(message)
    }
  )
})

describe("controlled completion provider output", () => {
  it("returns normalized valid structured output", async () => {
    await expect(
      generateCompletionPlan(completionInput, async () => ({
        output: {
          summary: "  Work through the release checklist.  ",
          steps: ["  Review changes.  ", "  Publish the release.  "],
        },
      }))
    ).resolves.toEqual({
      summary: "Work through the release checklist.",
      steps: ["Review changes.", "Publish the release."],
    })
  })

  it.each([
    { summary: "", steps: ["First", "Second"] },
    { summary: "Summary", steps: ["Only one"] },
    { summary: "Summary", steps: Array.from({ length: 6 }, () => "Step") },
    { summary: "Summary", steps: ["   ", "Second"] },
    { summary: "Summary", steps: ["s".repeat(181), "Second"] },
  ])("rejects malformed completion output %#", async (output) => {
    await expect(
      generateCompletionPlan(completionInput, async () => ({ output }))
    ).rejects.toThrow()
  })
})
