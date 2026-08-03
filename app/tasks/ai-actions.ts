"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  generateCompletionPlan,
  type CompletionPlan,
} from "@/lib/ai/task-completion"
import { generateDailyPlan } from "@/lib/ai/daily-plan"
import {
  generatePrioritySuggestion,
  type PrioritySuggestion,
} from "@/lib/ai/task-priority"
import {
  getUtcDateKey,
  MAX_DAILY_PLAN_TASKS,
  type DailyPlanItemView,
  type DailyPlanView,
} from "@/lib/daily-plan"
import {
  commitDailyPlanGeneration,
  releaseDailyPlanReservation,
  reorderDailyPlanForUser,
  reserveDailyPlanGeneration,
} from "@/lib/daily-plan-persistence"
import { prisma } from "@/lib/prisma"

const TASKS_PATH = "/tasks"

// Client input is untrusted even when it came from our own React form.
// Runtime limits also keep free-tier AI requests intentionally small.
const priorityRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  dueDate: z.string().trim().max(10),
})

// Completion plans are generated only for tasks that already exist. The client
// sends a small identifier; the server loads all AI context from PostgreSQL.
const taskIdSchema = z.string().trim().min(1).max(100)

// Reordering accepts ids only. Reasons and ownership are reloaded from the
// database so the browser cannot rewrite another user's plan metadata.
const orderedTaskIdsSchema = z
  .array(z.string().min(1).max(100))
  .min(1)
  .max(MAX_DAILY_PLAN_TASKS)

export type PrioritySuggestionActionResult =
  | {
      success: true
      suggestion: PrioritySuggestion
    }
  | {
      success: false
      message: string
    }

export type CompletionPlanActionResult =
  | {
      success: true
      plan: CompletionPlan
    }
  | {
      success: false
      message: string
    }

export type DailyPlanGenerationActionResult =
  | {
      success: true
      plan: DailyPlanView
      usageDate: string
      generationsUsedToday: number
    }
  | {
      success: false
      message: string
      usageDate?: string
      generationsUsedToday?: number
    }

export type ReorderDailyPlanActionResult =
  | {
      success: true
      items: DailyPlanItemView[]
    }
  | {
      success: false
      message: string
    }

// The Server Action is the trusted bridge between browser interaction and the
// external AI provider. The Gemini API key never crosses this server boundary.
export async function suggestTaskPriority(
  input: unknown
): Promise<PrioritySuggestionActionResult> {
  const { userId } = await auth()

  // Authentication is checked before consuming a limited external API quota.
  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to request a suggestion.",
    }
  }

  const parsedInput = priorityRequestSchema.safeParse(input)

  if (!parsedInput.success) {
    return {
      success: false,
      message: "Enter a valid title and description before requesting AI help.",
    }
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      message: "Gemini suggestions are not configured yet.",
    }
  }

  try {
    const suggestion = await generatePrioritySuggestion(parsedInput.data)

    return {
      success: true,
      suggestion,
    }
  } catch (error) {
    // Keep provider details in server logs; return a stable message to the browser.
    console.error("Gemini priority suggestion failed", error)

    return {
      success: false,
      message: "Could not generate a priority suggestion. Try again shortly.",
    }
  }
}

// Generate and persist guidance for one existing task. Ownership is enforced
// in both the read and write queries so a guessed task id is never sufficient.
export async function createTaskCompletionPlan(
  taskId: unknown
): Promise<CompletionPlanActionResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to generate a completion plan.",
    }
  }

  const parsedTaskId = taskIdSchema.safeParse(taskId)

  if (!parsedTaskId.success) {
    return {
      success: false,
      message: "Select a valid task before requesting AI help.",
    }
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      message: "Gemini suggestions are not configured yet.",
    }
  }

  try {
    // Read trusted task content from PostgreSQL instead of accepting editable
    // title, description, or ownership values from the browser.
    const task = await prisma.task.findFirst({
      where: {
        id: parsedTaskId.data,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        status: true,
        updatedAt: true,
      },
    })

    if (!task) {
      return {
        success: false,
        message: "Task not found.",
      }
    }

    if (task.status === "DONE") {
      return {
        success: false,
        message: "Reopen this task before generating a new completion plan.",
      }
    }

    const plan = await generateCompletionPlan({
      // Slicing bounds old database rows as well as newly validated rows, which
      // keeps accidental free-tier token usage under control.
      title: task.title.slice(0, 120),
      description: task.description.slice(0, 1000),
      priority: task.priority,
      dueDate: task.dueDate?.toISOString().slice(0, 10) ?? "No due date",
    })

    // updatedAt is an optimistic-concurrency check. If another tab edits or
    // completes the task while Gemini responds, do not attach a stale plan.
    const updateResult = await prisma.task.updateMany({
      where: {
        id: task.id,
        userId,
        updatedAt: task.updatedAt,
        status: {
          not: "DONE",
        },
      },
      data: {
        aiSuggestion: plan.summary,
        aiSteps: plan.steps,
      },
    })

    if (updateResult.count === 0) {
      return {
        success: false,
        message: "This task changed while Gemini was responding. Try again.",
      }
    }

    revalidatePath(TASKS_PATH)

    return {
      success: true,
      plan,
    }
  } catch (error) {
    console.error("Gemini completion plan failed", error)

    return {
      success: false,
      message: "Could not generate a completion plan. Try again shortly.",
    }
  }
}

// Build one current focus plan from every active task owned by the signed-in
// user. The empty argument prevents the browser from choosing the task context.
export async function createDailyPlan(): Promise<DailyPlanGenerationActionResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to generate a daily plan.",
    }
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      message: "Gemini suggestions are not configured yet.",
    }
  }

  let tasks: {
    id: string
    title: string
    description: string
    priority: string
    dueDate: Date | null
  }[]

  try {
    tasks = await prisma.task.findMany({
      where: {
        userId,
        status: {
          not: "DONE",
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
      },
    })
  } catch (error) {
    console.error("Daily plan task lookup failed", error)

    return {
      success: false,
      message: "Could not load tasks for daily planning. Try again shortly.",
    }
  }

  // Return before reserving quota when there is nothing valid to send Gemini.
  if (tasks.length === 0) {
    return {
      success: false,
      message: "Create or reopen an active task before planning your day.",
    }
  }

  if (tasks.length > MAX_DAILY_PLAN_TASKS) {
    return {
      success: false,
      message: `Daily planning supports up to ${MAX_DAILY_PLAN_TASKS} active tasks.`,
    }
  }

  const usageDate = getUtcDateKey()
  let reservation: Awaited<ReturnType<typeof reserveDailyPlanGeneration>>

  try {
    reservation = await reserveDailyPlanGeneration(userId, usageDate)
  } catch (error) {
    console.error("Daily plan quota reservation failed", error)

    return {
      success: false,
      message:
        "Could not verify today's daily-plan allowance. Try again shortly.",
    }
  }

  if (!reservation.reservationId) {
    return {
      success: false,
      message:
        "You have used today's plan and one regeneration. Try again after 00:00 UTC.",
      usageDate,
      generationsUsedToday: reservation.generationsUsedToday,
    }
  }

  const reservationId = reservation.reservationId
  let shouldReleaseReservation = true

  try {
    const output = await generateDailyPlan(
      tasks.map((task) => ({
        id: task.id,
        title: task.title.slice(0, 120),
        // Daily comparison needs enough context to distinguish tasks without
        // sending every potentially long description token to the provider.
        description: task.description.slice(0, 500),
        priority: task.priority,
        dueDate: task.dueDate?.toISOString().slice(0, 10) ?? "No due date",
      }))
    )

    const generatedAt = new Date()

    const savedResult = await commitDailyPlanGeneration({
      userId,
      usageDate,
      reservationId,
      output,
      generatedAt,
    })

    shouldReleaseReservation = false
    revalidatePath(TASKS_PATH)

    return {
      success: true,
      plan: {
        id: savedResult.plan.id,
        summary: output.summary,
        planDate: usageDate,
        generatedAt: generatedAt.toISOString(),
        items: output.items.map((item, index) => ({
          taskId: item.taskId,
          position: index + 1,
          reason: item.reason,
        })),
      },
      usageDate,
      generationsUsedToday: savedResult.generationsUsedToday,
    }
  } catch (error) {
    console.error("Gemini daily plan failed", error)

    return {
      success: false,
      message: "Could not generate a daily plan. Try again shortly.",
    }
  } finally {
    if (shouldReleaseReservation) {
      try {
        await releaseDailyPlanReservation(reservationId, userId, usageDate)
      } catch (releaseError) {
        console.error("Daily plan reservation release failed", releaseError)
      }
    }
  }
}

// Persist a human-selected order without calling Gemini or consuming quota.
// Delete-and-recreate avoids temporary conflicts with the unique position index.
export async function reorderDailyPlan(
  orderedTaskIds: unknown
): Promise<ReorderDailyPlanActionResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to reorder a daily plan.",
    }
  }

  const parsedTaskIds = orderedTaskIdsSchema.safeParse(orderedTaskIds)

  if (!parsedTaskIds.success) {
    return {
      success: false,
      message: "The requested task order is invalid.",
    }
  }

  const uniqueTaskIds = new Set(parsedTaskIds.data)

  if (uniqueTaskIds.size !== parsedTaskIds.data.length) {
    return {
      success: false,
      message: "A task cannot appear twice in the daily plan.",
    }
  }

  try {
    const result = await reorderDailyPlanForUser(userId, parsedTaskIds.data)

    if (result.status === "missing") {
      return {
        success: false,
        message: "Generate a daily plan before reordering tasks.",
      }
    }

    if (result.status === "changed") {
      return {
        success: false,
        message:
          "The plan changed before the new order could be saved. Refresh and try again.",
      }
    }

    revalidatePath(TASKS_PATH)

    return {
      success: true,
      items: result.items,
    }
  } catch (error) {
    console.error("Daily plan reorder failed", error)

    return {
      success: false,
      message: "Could not save the new task order. Try again shortly.",
    }
  }
}
