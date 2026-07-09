"use client"

// This component needs useState and event handlers, so it must be a Client Component.
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

// This tracks which form panel should be visible. null means no form is open.
type ActivePanel = "add" | "edit" | null

// Temporary seed data. Later, this will come from PostgreSQL through Prisma.
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

// Shared field classes keep inputs/selects visually consistent.
const fieldClass =
  "w-full rounded-2xl border border-app-border bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"

type StatCardProps = {
  icon: LucideIcon
  label: string
  value: number
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-app-border bg-app-panel p-5 shadow-lg shadow-black/15">
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

// This is not real AI yet. It gives us realistic UI behavior until the AI API is added.
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
  // tasks is the current in-browser task list. It resets on refresh until we add a database.
  const [tasks, setTasks] = useState(initialTasks)

  // form stores the current values typed into the add/edit form fields.
  const [form, setForm] = useState<TaskFormState>(emptyForm)

  // activePanel keeps add and edit from being open at the same time.
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  // editingTaskId tells the submit handler which task should be updated.
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)

  // These stats are derived from state, so they update automatically after every task action.
  const completedCount = tasks.filter((task) => task.status === "Done").length
  const activeCount = tasks.length - completedCount
  const highPriorityCount = tasks.filter(
    (task) => task.priority === "High"
  ).length

  // Copy before sorting because Array.sort() mutates the array it runs on.
  // Done tasks convert to 1, active tasks convert to 0, so active tasks sort first.
  const orderedTasks = [...tasks].sort(
    (taskA, taskB) =>
      Number(taskA.status === "Done") - Number(taskB.status === "Done")
  )

  // Resetting means closing any panel and clearing the form back to default values.
  function resetForm() {
    setForm(emptyForm)
    setActivePanel(null)
    setEditingTaskId(null)
  }

  // Opening add clears any existing edit state so add/edit panels stay mutually exclusive.
  function openAddPanel() {
    setForm(emptyForm)
    setEditingTaskId(null)
    setActivePanel("add")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent the browser's default page refresh so React can handle the form in memory.
    event.preventDefault()

    const title = form.title.trim()
    const description = form.description.trim()

    if (!title || !description) {
      return
    }

    // If the edit panel is active, update the matching task instead of creating a new one.
    if (activePanel === "edit" && editingTaskId) {
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

    // Safety guard: do not create a task unless the add panel submitted the form.
    if (activePanel !== "add") {
      return
    }

    // Generate a temporary numeric id from the largest current id.
    // A real database will generate ids later.
    const nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1

    // Add the new task at the top of the list so it appears immediately.
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

  // Load the selected task into the form, then show the edit panel.
  function handleEdit(task: Task) {
    setActivePanel("edit")
    setEditingTaskId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    })
  }

  // Delete uses filter to create a new array without the removed task.
  function handleDelete(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    )

    if (editingTaskId === taskId) {
      resetForm()
    }
  }

  // Toggle complete keeps the task but switches between Done and Todo.
  function handleToggleComplete(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "Done" ? "Todo" : "Done" }
          : task
      )
    )
  }

  // Main dashboard render. This JSX controls what the user sees on `/tasks`:
  // page shell, back navigation, stats, add/edit controls, form, and task cards.
  return (
    <main className="min-h-svh bg-app-background bg-[radial-gradient(circle_at_top_left,rgba(251,191,117,0.08),transparent_32%)] px-6 py-8 text-app-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Back navigation: lets the user return to the marketing/landing page. */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-brand-primary"
        >
          <ArrowLeft className="size-4" />
          Back to landing page
        </Link>

        {/* Header area: explains the dashboard and shows live stats from task state. */}
        <section className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-heading text-sm font-semibold tracking-[0.42em] text-brand-primary/90 uppercase">
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

        {/* Task controls: opens the create panel without showing the form by default. */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading text-xs font-semibold tracking-[0.3em] text-brand-soft uppercase">
              Manage tasks
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              To create new tasks select Add Task
            </h2>
          </div>
          <Button
            type="button"
            className="h-11 rounded-full bg-brand-primary px-5 text-stone-950 hover:bg-brand-primary-hover"
            onClick={openAddPanel}
          >
            <Plus />
            Add Task
          </Button>
        </div>

        {/* Add/edit panel: appears only when the user is creating or editing a task. */}
        {activePanel ? (
          <section className="mt-6 rounded-[2rem] border border-app-border bg-app-surface p-5 shadow-xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-heading text-xs font-semibold tracking-[0.3em] text-brand-soft uppercase">
                  {activePanel === "edit" ? "Editing task" : "Create task"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {activePanel === "edit"
                    ? "Update this task"
                    : "Add a new task"}
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-full border-app-border bg-white/5 text-stone-100 hover:bg-white/10"
                onClick={resetForm}
              >
                <X />
                Cancel
              </Button>
            </div>

            {/* Controlled form: every field reads from `form` state and updates it on change. */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 lg:grid-cols-4"
            >
              <label className="lg:col-span-2">
                <span className="text-sm font-medium text-stone-300">
                  Title
                </span>
                <input
                  className="mt-2 w-full rounded-2xl border border-app-border bg-white/[0.06] px-4 py-3 text-sm text-white transition outline-none placeholder:text-stone-500 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"
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
                  className="h-11 rounded-full bg-brand-primary px-5 text-stone-950 hover:bg-brand-primary-hover"
                >
                  <Plus />
                  {activePanel === "edit" ? "Save changes" : "Create task"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {/* Task grid: renders the sorted task list and wires each card to dashboard actions. */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {orderedTasks.map((task) => (
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
