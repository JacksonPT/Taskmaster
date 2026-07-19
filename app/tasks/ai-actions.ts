"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  generateCompletionPlan,
  type CompletionPlan,
} from "@/lib/ai/task-completion"
import {
  generatePrioritySuggestion,
  type PrioritySuggestion,
} from "@/lib/ai/task-priority"
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
