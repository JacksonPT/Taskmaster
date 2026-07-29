// Shared constants keep the browser labels, Server Action enforcement, and AI
// output limits aligned without importing provider code into Client Components.
export const MAX_DAILY_PLAN_GENERATIONS = 2
export const MAX_DAILY_PLAN_TASKS = 25

export type DailyPlanItemView = {
  taskId: string
  position: number
  reason: string
}

export type DailyPlanView = {
  id: string
  summary: string
  planDate: string
  generatedAt: string
  items: DailyPlanItemView[]
}

export type DailyPlanState = {
  plan: DailyPlanView | null
  usageDate: string
  generationsUsedToday: number
}

// A server-derived UTC key makes the quota deterministic and prevents changing
// a browser clock or timezone from creating extra daily generations.
export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}
