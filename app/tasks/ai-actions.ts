"use server"

import { auth } from "@clerk/nextjs/server"
import { z } from "zod"

import {
  generatePrioritySuggestion,
  type PrioritySuggestion,
} from "@/lib/ai/task-priority"

// Client input is untrusted even when it came from our own React form.
// Runtime limits also keep free-tier AI requests intentionally small.
const priorityRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  dueDate: z.string().trim().max(10),
})

export type PrioritySuggestionActionResult =
  | {
      success: true
      suggestion: PrioritySuggestion
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
