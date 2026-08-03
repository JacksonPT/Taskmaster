import type { DailyPlanView } from "@/lib/daily-plan"

type ProgressTask = {
  id: string
  status: string
  dueDateInput: string
  completedAt: string
}

type ProgressInput = {
  tasks: ProgressTask[]
  dailyPlan: DailyPlanView | null
  currentUtcDateKey: string
  now: Date
}

export type ProgressMetrics = {
  activeCount: number
  overdueCount: number
  completedThisWeek: number
  currentPlanItemCount: number
  completedPlanItemCount: number
  hasCurrentPlan: boolean
  focusPercentage: number
}

export function getUtcWeekStartTime(now: Date) {
  // Sunday=0 becomes six elapsed days, while Monday=1 becomes zero.
  const daysSinceMonday = (now.getUTCDay() + 6) % 7

  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday
  )
}

export function getProgressMetrics({
  tasks,
  dailyPlan,
  currentUtcDateKey,
  now,
}: ProgressInput): ProgressMetrics {
  const nowTime = now.getTime()
  const weekStartTime = getUtcWeekStartTime(now)
  const activeTasks = tasks.filter((task) => task.status !== "Done")
  const overdueCount = activeTasks.filter(
    (task) => task.dueDateInput && task.dueDateInput < currentUtcDateKey
  ).length
  const completedThisWeek = tasks.filter((task) => {
    if (task.status !== "Done" || !task.completedAt) {
      return false
    }

    const completedTime = Date.parse(task.completedAt)
    return completedTime >= weekStartTime && completedTime <= nowTime
  }).length
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  const currentPlanItems =
    dailyPlan?.planDate === currentUtcDateKey
      ? dailyPlan.items.filter((item) => tasksById.has(item.taskId))
      : []
  const completedPlanItemCount = currentPlanItems.filter(
    (item) => tasksById.get(item.taskId)?.status === "Done"
  ).length
  const currentPlanItemCount = currentPlanItems.length
  const hasCurrentPlan = currentPlanItemCount > 0

  return {
    activeCount: activeTasks.length,
    overdueCount,
    completedThisWeek,
    currentPlanItemCount,
    completedPlanItemCount,
    hasCurrentPlan,
    focusPercentage: hasCurrentPlan
      ? Math.round((completedPlanItemCount / currentPlanItemCount) * 100)
      : 0,
  }
}
