"use client"

import { type FormEvent, useState } from "react"
import { ArrowLeft, ListChecks, Plus, Timer, Trophy, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  TaskCard,
  type Task,
  type TaskPriority,
} from "@/components/tasks/task-card"
import { Button } from "@/components/ui/button"

type TaskFormState = {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Set up project README",
    description: "Document the app idea, stack, MVP scope, and build roadmap.",
    priority: "High",
    status: "Done",
    dueDate: "Today",
    aiSuggestion:
      "Keep this short and clear so the project is easy to explain on GitHub and in interviews.",
  },
  {
    id: 2,
    title: "Design the first task dashboard",
    description:
      "Create the layout users will eventually see after logging in.",
    priority: "High",
    status: "In Progress",
    dueDate: "Today",
    aiSuggestion:
      "Start with mock data first. This lets you learn UI structure before adding a database.",
  },
  {
    id: 3,
    title: "Choose database provider",
    description: "Compare Neon and Supabase for hosted PostgreSQL.",
    priority: "Medium",
    status: "Todo",
    dueDate: "This week",
    aiSuggestion:
      "Pick the option with the clearest free tier and easiest connection string setup.",
  },
  {
    id: 4,
    title: "Write auth notes",
    description: "List what should be private once users can log in.",
    priority: "Low",
    status: "Todo",
    dueDate: "Later",
    aiSuggestion:
      "Focus on task ownership first: each user should only see the tasks they created.",
  },
]

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "Today",
}

const fieldClass =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-100/50 focus:ring-4 focus:ring-amber-100/10"

function buildTemporaryAiSuggestion(task: TaskFormState) {
  if (task.priority === "High") {
    return "Start this early and define the first concrete action before doing lower-priority work."
  }

  if (task.priority === "Medium") {
    return "Schedule this after your high-priority work so it keeps moving without taking over the day."
  }

  return "Keep this available as a quick win, but do not let it interrupt higher-impact work."
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [form, setForm] = useState<TaskFormState>(emptyForm)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  // These stats are derived from state, so they update automatically after every task action.
  const completedCount = tasks.filter((task) => task.status === "Done").length
  const activeCount = tasks.length - completedCount
  const highPriorityCount = tasks.filter(
    (task) => task.priority === "High"
  ).length

  function resetForm() {
    setForm(emptyForm)
    setEditingTaskId(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = form.title.trim()
    const description = form.description.trim()

    if (!title || !description) {
      return
    }

    if (editingTaskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title,
                description,
                priority: form.priority,
                dueDate: form.dueDate,
                aiSuggestion: buildTemporaryAiSuggestion(form),
              }
            : task
        )
      )
      resetForm()
      return
    }

    const nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1

    setTasks((currentTasks) => [
      {
        id: nextId,
        title,
        description,
        priority: form.priority,
        status: "Todo",
        dueDate: form.dueDate,
        aiSuggestion: buildTemporaryAiSuggestion(form),
      },
      ...currentTasks,
    ])

    resetForm()
  }

  function handleEdit(task: Task) {
    setEditingTaskId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    })
  }

  function handleDelete(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    )

    if (editingTaskId === taskId) {
      resetForm()
    }
  }

  function handleToggleComplete(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "Done" ? "Todo" : "Done" }
          : task
      )
    )
  }

  type StatCardProps = {
    icon: LucideIcon
    label: string
    value: number
  }
  
  function StatCard({ icon: Icon, label, value }: StatCardProps) {
    return (
      <div className="rounded-3xl border border-white/15 bg-[#151922] p-5 shadow-lg shadow-black/15">
        <Icon className="size-5 text-amber-200" />
        <p className="mt-4 text-4xl font-bold tracking-tight text-white">
          {value}
        </p>
        <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-stone-300 uppercase">
          {label}
        </p>
      </div>
    )
  }


  return (
    <main className="min-h-svh bg-[#070b10] bg-[radial-gradient(circle_at_top_left,rgba(251,191,117,0.08),transparent_32%)] px-6 py-8 text-stone-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="size-4" />
          Back to landing page
        </Link>

        <section className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-heading text-sm font-semibold tracking-[0.42em] text-amber-50/90 uppercase">
              Local state task workspace
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl font-light tracking-[0.08em] text-white uppercase sm:text-6xl">
              Your task command center
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-stone-200">
              Create, edit, complete, and delete tasks in the browser. These
              changes are temporary until we connect PostgreSQL and Prisma.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={ListChecks}
              label="Total tasks"
              value={tasks.length}
            />
            <StatCard icon={Timer} label="Active" value={activeCount} />
            <StatCard
              icon={Trophy}
              label="High priority"
              value={highPriorityCount}
            />
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-white/15 bg-[#10151d] p-5 shadow-xl shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-heading text-xs font-semibold tracking-[0.3em] text-amber-100/70 uppercase">
                {editingTaskId ? "Editing task" : "Create task"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {editingTaskId ? "Update this task" : "Add a new task"}
              </h2>
            </div>

            {editingTaskId ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-stone-100 hover:bg-white/10"
                onClick={resetForm}
              >
                <X />
                Cancel edit
              </Button>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 lg:grid-cols-4"
          >
            <label className="lg:col-span-2">
              <span className="text-sm font-medium text-stone-300">Title</span>
              <input
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white transition outline-none placeholder:text-stone-500 focus:border-amber-100/50 focus:ring-4 focus:ring-amber-100/10"
                value={form.title}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    title: event.target.value,
                  }))
                }
                placeholder="Example: Finish project proposal"
              />
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Priority
              </span>
              <select
                className={`${fieldClass} mt-2`}
                value={form.priority}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    priority: event.target.value as TaskPriority,
                  }))
                }
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>

            <label>
              <span className="text-sm font-medium text-stone-300">
                Due date
              </span>
              <input
                className={`${fieldClass} mt-2`}
                value={form.dueDate}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    dueDate: event.target.value,
                  }))
                }
                placeholder="Today"
              />
            </label>

            <label className="lg:col-span-4">
              <span className="text-sm font-medium text-stone-300">
                Description
              </span>
              <textarea
                className={`${fieldClass} mt-2 min-h-28 resize-y`}
                value={form.description}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    description: event.target.value,
                  }))
                }
                placeholder="What needs to happen?"
              />
            </label>

            <div className="lg:col-span-4">
              <Button
                type="submit"
                className="h-11 rounded-full bg-amber-100 px-5 text-stone-950 hover:bg-amber-200"
              >
                <Plus />
                {editingTaskId ? "Save changes" : "Add task"}
              </Button>
            </div>
          </form>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </section>
      </div>
    </main>
  )
}


