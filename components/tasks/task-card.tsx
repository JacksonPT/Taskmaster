import {
  CalendarDays,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// These union types limit tasks to known values instead of any random string.
export type TaskPriority = "High" | "Medium" | "Low"
export type TaskStatus = "Todo" | "In Progress" | "Done"

// Task describes the shape of one task throughout the UI.
export type Task = {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  dueDateInput: string
  priorityReason: string
  aiSuggestion: string
  aiSteps: string[]
}

// Record<TaskPriority, string> means every priority must have a style.
// TypeScript will warn us if we add a new priority and forget its class names.
const priorityStyles: Record<TaskPriority, string> = {
  High: "border-red-300/30 bg-red-400/10 text-red-100",
  Medium: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  Low: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
}

// Each status gets its own icon component from lucide-react.
const statusIcons: Record<TaskStatus, typeof Circle> = {
  Todo: Circle,
  "In Progress": Sparkles,
  Done: CheckCircle2,
}

type TaskCardProps = {
  task: Task
  // The card displays buttons, but the dashboard owns the actual state changes.
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
  onGeneratePlan: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  isGeneratingPlan: boolean
  isPlanActionDisabled: boolean
  planError: string | null
}

export function TaskCard({
  task,
  onDelete,
  onEdit,
  onGeneratePlan,
  onToggleComplete,
  isGeneratingPlan,
  isPlanActionDisabled,
  planError,
}: TaskCardProps) {
  const StatusIcon = statusIcons[task.status]
  const isDone = task.status === "Done"
  const hasCompletionPlan = Boolean(
    task.aiSuggestion && task.aiSteps.length > 0
  )

  return (
    <article
      className={cn(
        "rounded-3xl border border-app-border bg-app-card p-5 shadow-xl shadow-black/20",
        // Completed tasks stay visible, but muted so active tasks have more attention.
        isDone && "border-white/10 bg-app-completed opacity-70"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            priorityStyles[task.priority]
          )}
        >
          {task.priority} priority
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
          <StatusIcon className="size-3.5" />
          {task.status}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
        {task.title}
      </h2>
      <p className="mt-3 text-base leading-7 text-stone-300">
        {task.description}
      </p>

      {task.priorityReason ? (
        <div className="mt-6 rounded-2xl border border-violet-200/20 bg-violet-300/6 p-4">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-violet-100 uppercase">
            <Sparkles className="size-4" />
            AI priority rationale
          </p>
          <p className="mt-3 text-sm leading-6 text-stone-200">
            {task.priorityReason}
          </p>
        </div>
      ) : null}

      {/* Keep the card compact until the user has generated a real plan. */}
      {hasCompletionPlan ? (
        <div
          className="mt-6 rounded-2xl border border-brand-primary/20 bg-app-elevated p-4"
          aria-live="polite"
        >
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-primary uppercase">
            <Sparkles className="size-4" />
            AI completion plan
          </p>
          <p className="mt-3 text-base leading-7 text-stone-200">
            {task.aiSuggestion}
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-stone-300 marker:font-semibold marker:text-brand-primary">
            {task.aiSteps.map((step, index) => (
              <li key={`${task.id}-step-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <p className="mt-6 flex items-center gap-2 text-sm font-medium text-stone-300">
        <CalendarDays className="size-4" />
        Due {task.dueDate}
      </p>

      {planError ? (
        <p className="mt-4 text-sm font-medium text-red-200" role="alert">
          {planError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <Button
          type="button"
          variant={isDone ? "outline" : "default"}
          size="sm"
          className={cn(
            "rounded-full",
            !isDone &&
              "bg-brand-primary text-stone-950 hover:bg-brand-primary-hover"
          )}
          disabled={isGeneratingPlan}
          onClick={() => onToggleComplete(task.id)}
        >
          <CheckCircle2 />
          {isDone ? "Reopen" : "Complete"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isGeneratingPlan}
          className="rounded-full border-app-border bg-white/5 text-stone-100 hover:bg-white/10"
          onClick={() => onEdit(task)}
        >
          <Pencil />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isGeneratingPlan}
          className="rounded-full border-red-200/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 />
          Delete
        </Button>
        {!isDone ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPlanActionDisabled}
            className="rounded-full border-brand-primary/25 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
            onClick={() => onGeneratePlan(task.id)}
          >
            {isGeneratingPlan ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {isGeneratingPlan
              ? "Building plan..."
              : hasCompletionPlan
                ? "Regenerate plan"
                : "Generate action plan"}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
