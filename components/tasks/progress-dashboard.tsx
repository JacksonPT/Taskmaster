import { CalendarCheck2, CircleAlert, ListTodo, Target } from "lucide-react"

import type { DailyPlanView } from "@/lib/daily-plan"
import { cn } from "@/lib/utils"

import type { Task } from "./task-card"

type ProgressDashboardProps = {
  tasks: Task[]
  dailyPlan: DailyPlanView | null
  currentUtcDateKey: string
}

type MetricCardProps = {
  icon: typeof ListTodo
  label: string
  value: string | number
  detail: string
  tone?: "default" | "warning" | "success"
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: MetricCardProps) {
  return (
    <div className="min-w-0 bg-app-panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.16em] text-stone-300 uppercase">
          {label}
        </p>
        <Icon
          className={cn(
            "size-4 text-brand-primary",
            tone === "warning" && "text-red-200",
            tone === "success" && "text-emerald-200"
          )}
        />
      </div>
      <p className="mt-3 font-heading text-3xl font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-stone-400">{detail}</p>
    </div>
  )
}

function getUtcWeekStart(now: Date) {
  // Convert Sunday=0 into six elapsed days and Monday=1 into zero, then
  // construct midnight with Date.UTC so browser timezone cannot move the week.
  const daysSinceMonday = (now.getUTCDay() + 6) % 7

  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday
  )
}

export function ProgressDashboard({
  tasks,
  dailyPlan,
  currentUtcDateKey,
}: ProgressDashboardProps) {
  const now = new Date()
  const nowTime = now.getTime()
  const weekStartTime = getUtcWeekStart(now)
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
  // A saved plan is a dated snapshot. Ignore older snapshots so yesterday's
  // progress never appears as today's focus metric.
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  const currentPlanItems =
    dailyPlan?.planDate === currentUtcDateKey
      ? dailyPlan.items.filter((item) => tasksById.has(item.taskId))
      : []
  const completedPlanItems = currentPlanItems.filter(
    (item) => tasksById.get(item.taskId)?.status === "Done"
  ).length
  const hasCurrentPlan = currentPlanItems.length > 0
  const focusPercentage = hasCurrentPlan
    ? Math.round((completedPlanItems / currentPlanItems.length) * 100)
    : 0

  return (
    <section
      aria-label="Progress dashboard"
      className="grid gap-px overflow-hidden rounded-[1.75rem] border border-app-border bg-white/10 shadow-xl shadow-black/20 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        icon={ListTodo}
        label="Active"
        value={activeTasks.length}
        detail="Tasks still in motion"
      />
      <MetricCard
        icon={CircleAlert}
        label="Overdue"
        value={overdueCount}
        detail="Active tasks due before today (UTC)"
        tone={overdueCount > 0 ? "warning" : "default"}
      />
      <MetricCard
        icon={CalendarCheck2}
        label="Completed this week"
        value={completedThisWeek}
        detail="Recorded since Monday 00:00 UTC"
        tone={completedThisWeek > 0 ? "success" : "default"}
      />
      <MetricCard
        icon={Target}
        label="Daily focus"
        value={hasCurrentPlan ? `${focusPercentage}%` : "N/A"}
        detail={
          hasCurrentPlan
            ? `${completedPlanItems} of ${currentPlanItems.length} planned tasks done`
            : "No focus plan saved for today"
        }
        tone={focusPercentage === 100 ? "success" : "default"}
      />
    </section>
  )
}
