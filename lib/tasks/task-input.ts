import { z } from "zod"

export const taskIdSchema = z.string().trim().min(1).max(100)

export const taskPrioritySchema = z.enum(["High", "Medium", "Low"])

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export const taskFormInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  priority: taskPrioritySchema,
  priorityReason: z.string().trim().max(240),
  dueDate: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidDateKey(value), {
      message: "Enter a valid due date.",
    }),
})

export type TaskFormInput = z.infer<typeof taskFormInputSchema>

export function parseTaskDueDate(value: string) {
  return value ? new Date(`${value}T12:00:00`) : null
}
