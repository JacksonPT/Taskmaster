import { CalendarCheck2, CircleAlert, ListTodo, Target } from "lucide-react"

import type { DailyPlanView } from "@/lib/daily-plan"
import { getProgressMetrics } from "@/lib/tasks/progress"
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

export function ProgressDashboard({
  tasks,
  dailyPlan,
  currentUtcDateKey,
}: ProgressDashboardProps) {
  const {
    activeCount,
    overdueCount,
    completedThisWeek,
    currentPlanItemCount,
    completedPlanItemCount,
    hasCurrentPlan,
    focusPercentage,
  } = getProgressMetrics({
    tasks,
    dailyPlan,
    currentUtcDateKey,
    now: new Date(),
  })

  return (
    <section
      aria-label="Progress dashboard"
      className="grid gap-px overflow-hidden rounded-[1.75rem] border border-app-border bg-white/10 shadow-xl shadow-black/20 sm:grid-cols-2 xl:grid-cols-4"
    >
      <MetricCard
        icon={ListTodo}
        label="Active"
        value={activeCount}
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
            ? `${completedPlanItemCount} of ${currentPlanItemCount} planned tasks done`
            : "No focus plan saved for today"
        }
        tone={focusPercentage === 100 ? "success" : "default"}
      />
    </section>
  )
}
