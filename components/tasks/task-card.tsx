import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TaskPriority = "High" | "Medium" | "Low"
export type TaskStatus = "Todo" | "In Progress" | "Done"

export type Task = {
  id: number
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  aiSuggestion: string
}

const priorityStyles: Record<TaskPriority, string> = {
  High: "border-red-300/30 bg-red-400/10 text-red-100",
  Medium: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  Low: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
}

const statusIcons: Record<TaskStatus, typeof Circle> = {
  Todo: Circle,
  "In Progress": Sparkles,
  Done: CheckCircle2,
}

type TaskCardProps = {
  task: Task
  onDelete: (taskId: number) => void
  onEdit: (task: Task) => void
  onToggleComplete: (taskId: number) => void
}

export function TaskCard({
  task,
  onDelete,
  onEdit,
  onToggleComplete,
}: TaskCardProps) {
  const StatusIcon = statusIcons[task.status]
  const isDone = task.status === "Done"

  return (
    <article
      className={cn(
        "rounded-3xl border border-white/15 bg-[#12171f] p-5 shadow-xl shadow-black/20",
        isDone && "border-white/10 bg-stone-900/60 opacity-70"
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

      <div className="mt-6 rounded-2xl border border-amber-100/20 bg-[#202125] p-4">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-amber-100 uppercase">
          <Sparkles className="size-4" />
          AI suggestion
        </p>
        <p className="mt-3 text-base leading-7 text-stone-200">
          {task.aiSuggestion}
        </p>
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm font-medium text-stone-300">
        <CalendarDays className="size-4" />
        Due {task.dueDate}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <Button
          type="button"
          variant={isDone ? "outline" : "default"}
          size="sm"
          className={cn(
            "rounded-full",
            !isDone && "bg-amber-100 text-stone-950 hover:bg-amber-200"
          )}
          onClick={() => onToggleComplete(task.id)}
        >
          <CheckCircle2 />
          {isDone ? "Reopen" : "Complete"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-white/15 bg-white/5 text-stone-100 hover:bg-white/10"
          onClick={() => onEdit(task)}
        >
          <Pencil />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-red-200/20 bg-red-500/10 text-red-100 hover:bg-red-500/20"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 />
          Delete
        </Button>
      </div>
    </article>
  )
}
