"use client"

import { useRef } from "react"
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
  isCollapsed: boolean
  isReordering: boolean
  onToggleCollapsed: () => void
  onMove: (taskId: string, direction: "up" | "down") => void
}

const DAILY_PLAN_CONTENT_ID = "daily-plan-sidebar-content"

// The plan stores task ids instead of copied titles or statuses. Looking up the
// live task keeps this sheet synchronized after edits and completion changes.
export function DailyPlanPanel({
  plan,
  tasks,
  isCollapsed,
  isReordering,
  onToggleCollapsed,
  onMove,
}: DailyPlanPanelProps) {
  const collapsedToggleRef = useRef<HTMLButtonElement>(null)
  const expandedToggleRef = useRef<HTMLButtonElement>(null)
  const tasksById = new Map(tasks.map((task) => [task.id, task]))
  // Item reasons remain in persisted plan data; this compact view intentionally
  // uses only the plan-level summary as its explanation.
  const visibleItems = plan.items.filter((item) => tasksById.has(item.taskId))
  const formattedPlanDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${plan.planDate}T00:00:00Z`))

  function handleToggleCollapsed() {
    // The visible toggle changes when the panel changes state. Move focus to its
    // replacement so keyboard users can immediately reverse the action.
    const nextToggleRef = isCollapsed ? expandedToggleRef : collapsedToggleRef

    onToggleCollapsed()
    window.requestAnimationFrame(() => nextToggleRef.current?.focus())
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-brand-primary/25 bg-app-surface shadow-xl shadow-black/20">
      {/* The narrow rail keeps one recognizable, keyboard-accessible reopen control. */}
      {isCollapsed ? (
        <Button
          ref={collapsedToggleRef}
          type="button"
          variant="ghost"
          className="flex h-full min-h-0 w-full flex-row justify-between gap-4 rounded-[2rem] px-5 py-4 text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary xl:min-h-72 xl:flex-col xl:justify-start xl:px-2 xl:py-5"
          aria-label="Expand daily plan"
          aria-expanded={false}
          aria-controls={DAILY_PLAN_CONTENT_ID}
          onClick={handleToggleCollapsed}
        >
          <Sparkles className="size-5" />
          <span className="font-heading text-xs font-bold tracking-[0.2em] uppercase xl:rotate-180 xl:[writing-mode:vertical-rl]">
            Daily plan
          </span>
          <ChevronRight className="size-4 rotate-90 xl:mt-auto xl:rotate-0" />
        </Button>
      ) : null}

      <div id={DAILY_PLAN_CONTENT_ID} hidden={isCollapsed}>
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(251,191,117,0.12),transparent_65%)] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-heading text-xs font-bold tracking-[0.25em] text-brand-primary uppercase">
                <Sparkles className="size-4" />
                Daily focus sheet
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                {formattedPlanDate}
              </h2>
            </div>
            <Button
              ref={expandedToggleRef}
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-stone-300 hover:bg-white/10 hover:text-white"
              aria-label="Collapse daily plan"
              aria-expanded={true}
              aria-controls={DAILY_PLAN_CONTENT_ID}
              onClick={handleToggleCollapsed}
            >
              <ChevronLeft />
            </Button>
          </div>
          <div className="mt-4">
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
                  "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4",
                  isDone && "bg-white/2.5 opacity-65"
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-full border border-brand-primary/25 bg-brand-primary/10 font-heading text-xs font-bold text-brand-primary">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="flex items-start gap-2 text-sm leading-5 font-semibold text-white">
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                    ) : (
                      <Circle className="mt-0.5 size-4 text-stone-500" />
                    )}
                    <span
                      className={cn("break-words", isDone && "line-through")}
                    >
                      {task.title}
                    </span>
                  </p>
                </div>

                {/* Icon buttons remain keyboard accessible through explicit labels. */}
                <div className="flex gap-1.5 justify-self-end">
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
      </div>
    </section>
  )
}
