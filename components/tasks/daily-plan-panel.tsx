"use client"

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { DailyPlanView } from "@/lib/daily-plan"
import { cn } from "@/lib/utils"

import type { Task } from "./task-card"

type DailyPlanPanelProps = {
  plan: DailyPlanView
  tasks: Task[]
  isReordering: boolean
  onMove: (taskId: string, direction: "up" | "down") => void
}

// The plan stores task ids instead of copied titles or statuses. Looking up the
// live task keeps this sheet synchronized after edits and completion changes.
export function DailyPlanPanel({
  plan,
  tasks,
  isReordering,
  onMove,
}: DailyPlanPanelProps) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  const visibleItems = plan.items.filter((item) => tasksById.has(item.taskId))
  const formattedPlanDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${plan.planDate}T00:00:00Z`))

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-brand-primary/25 bg-app-surface shadow-xl shadow-black/20">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(251,191,117,0.12),transparent_65%)] p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-heading text-xs font-bold tracking-[0.25em] text-brand-primary uppercase">
              <Sparkles className="size-4" />
              Daily focus sheet
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {formattedPlanDate}
            </h2>
          </div>
          <span className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
            {visibleItems.length} planned tasks
          </span>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-stone-200">
          {plan.summary}
        </p>
      </div>

      <ol className="divide-y divide-white/10">
        {visibleItems.map((item, index) => {
          const task = tasksById.get(item.taskId)!
          const isDone = task.status === "Done"

          return (
            <li
              key={item.taskId}
              className={cn(
                "grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6",
                isDone && "bg-white/2.5 opacity-65"
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-brand-primary/25 bg-brand-primary/10 font-heading text-sm font-bold text-brand-primary">
                {index + 1}
              </span>

              <div>
                <p className="flex items-center gap-2 text-lg font-semibold text-white">
                  {isDone ? (
                    <CheckCircle2 className="size-4 text-emerald-300" />
                  ) : (
                    <Circle className="size-4 text-stone-500" />
                  )}
                  <span className={cn(isDone && "line-through")}>
                    {task.title}
                  </span>
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  {item.reason}
                </p>
              </div>

              {/* Icon buttons remain keyboard accessible through explicit labels. */}
              <div className="flex gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isReordering || index === 0}
                  className="rounded-full border-app-border bg-white/5 text-stone-100 hover:bg-white/10"
                  aria-label={`Move ${task.title} up`}
                  onClick={() => onMove(task.id, "up")}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isReordering || index === visibleItems.length - 1}
                  className="rounded-full border-app-border bg-white/5 text-stone-100 hover:bg-white/10"
                  aria-label={`Move ${task.title} down`}
                  onClick={() => onMove(task.id, "down")}
                >
                  <ArrowDown />
                </Button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
