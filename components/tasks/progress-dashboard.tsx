import { CalendarCheck2, CircleAlert, ListTodo, Target } from "lucide-react"

import type { DailyPlanView } from "@/lib/daily-plan"
import { cn } from "@/lib/utils"

import type { Task, TaskPriority } from "./task-card"

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

const priorityOrder: TaskPriority[] = ["High", "Medium", "Low"]

const priorityStyles: Record<TaskPriority, string> = {
  High: "bg-red-300",
  Medium: "bg-amber-200",
  Low: "bg-emerald-300",
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
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
  const unknownCompletionCount = tasks.filter(
    (task) => task.status === "Done" && !task.completedAt
  ).length
  const priorityCounts: Record<TaskPriority, number> = {
    High: 0,
    Medium: 0,
    Low: 0,
  }

  for (const task of activeTasks) {
    priorityCounts[task.priority] += 1
  }

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
      aria-labelledby="progress-dashboard-heading"
      className="rounded-[2rem] border border-app-border bg-app-panel p-5 shadow-xl shadow-black/20 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold tracking-[0.25em] text-brand-primary uppercase">
            Module 14
          </p>
          <h2
            id="progress-dashboard-heading"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Progress dashboard
          </h2>
        </div>
        <p className="text-xs font-medium text-stone-400">UTC / Monday week</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
          detail="Active tasks due before today"
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
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white">
            Active priorities
          </h3>
          <span className="text-xs text-stone-400">
            {activeTasks.length} total
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {priorityOrder.map((priority) => {
            const count = priorityCounts[priority]
            const percentage =
              activeTasks.length > 0
                ? Math.round((count / activeTasks.length) * 100)
                : 0

            return (
              <div key={priority}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-stone-200">{priority}</span>
                  <span className="text-stone-400">
                    {count} / {percentage}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8"
                  role="progressbar"
                  aria-label={`${priority} priority active tasks`}
                  aria-valuemin={0}
                  aria-valuemax={Math.max(activeTasks.length, 1)}
                  aria-valuenow={count}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-300",
                      priorityStyles[priority]
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {unknownCompletionCount > 0 ? (
        <p className="mt-4 text-xs leading-5 text-stone-400">
          {unknownCompletionCount} earlier completed
          {unknownCompletionCount === 1 ? " task is" : " tasks are"} excluded
          from this week because completion time is unknown.
        </p>
      ) : null}
    </section>
  )
}
