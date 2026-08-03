import { z } from "zod"

import { MAX_DAILY_PLAN_TASKS } from "@/lib/daily-plan"

export const dailyPlanOutputSchema = z.object({
  summary: z.string().trim().min(1).max(240),
  items: z
    .array(
      z.object({
        // IDs are intentionally not normalized; the provider must copy them.
        taskId: z.string().min(1),
        reason: z.string().trim().min(1).max(200),
      })
    )
    .min(1)
    .max(MAX_DAILY_PLAN_TASKS),
})

export type DailyPlanOutput = z.infer<typeof dailyPlanOutputSchema>

export type DailyPlanTaskInput = {
  id: string
  title: string
  description: string
  priority: string
  dueDate: string
}

// Shape validation is not enough: every supplied task must appear exactly once.
export function validateReturnedTaskIds(
  tasks: DailyPlanTaskInput[],
  output: DailyPlanOutput
) {
  if (output.items.length !== tasks.length) {
    throw new Error("Gemini did not return every active task.")
  }

  const expectedTaskIds = new Set(tasks.map((task) => task.id))
  const returnedTaskIds = new Set<string>()

  for (const item of output.items) {
    if (!expectedTaskIds.has(item.taskId)) {
      throw new Error("Gemini returned an unknown task id.")
    }

    if (returnedTaskIds.has(item.taskId)) {
      throw new Error("Gemini returned a task more than once.")
    }

    returnedTaskIds.add(item.taskId)
  }
}
