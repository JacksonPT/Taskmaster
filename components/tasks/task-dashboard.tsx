"use client"

// This component needs useState and event handlers, so it must be a Client Component.
import { type FormEvent, useState } from "react"
import { ArrowLeft, ListChecks, Plus, Timer, Trophy, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

import {
  createTask,
  deleteTask,
  toggleTaskComplete,
  updateTask,
} from "@/app/tasks/actions"
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

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
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

type TaskDashboardProps = {
  initialTasks: Task[]
}

export function TaskDashboard({ initialTasks }: TaskDashboardProps) {
  // The first task list comes from PostgreSQL through the /tasks Server Component.
  // We keep a local copy so the UI can update immediately after server actions succeed.
  const [tasks, setTasks] = useState(initialTasks)

  // form stores the current values typed into the add/edit form fields.
  const [form, setForm] = useState<TaskFormState>(emptyForm)

  // activePanel keeps add and edit from being open at the same time.
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  // editingTaskId tells the submit handler which task should be updated.
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  // These small state values help the user understand when a database action is running or failed.
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

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
    setFormError(null)
    setActivePanel(null)
    setEditingTaskId(null)
  }

  // Opening add clears any existing edit state so add/edit panels stay mutually exclusive.
  function openAddPanel() {
    setForm(emptyForm)
    setEditingTaskId(null)
    setActivePanel("add")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent the browser's default page refresh so React can handle the form in memory.
    event.preventDefault()

    const title = form.title.trim()
    const description = form.description.trim()

    if (!title || !description) {
      setFormError("Title and description are required.")
      return
    }

    setIsSaving(true)
    setFormError(null)

    //EDIT SUBMIT
    // If the edit panel is active, update the matching task instead of creating a new one.
    if (activePanel === "edit" && editingTaskId) {
      try {
        const updatedTask = await updateTask(editingTaskId, {
          title,
          description,
          priority: form.priority,
          dueDate: form.dueDate,
        })

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTaskId ? updatedTask : task
          )
        )

        resetForm()
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Could not update task."
        )
      } finally {
        setIsSaving(false)
      }
      return
    }

    // Safety guard: do not create a task unless the add panel submitted the form.
    if (activePanel !== "add") {
      setIsSaving(false)
      return
    }

    //CREATE SUBMIT
    try {
      const createdTask = await createTask({
        title,
        description,
        priority: form.priority,
        dueDate: form.dueDate,
      })

      // Add the returned database row at the top of the list so it appears immediately.
      setTasks((currentTasks) => [createdTask, ...currentTasks])

      resetForm()
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not create task."
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Load the selected task into the form, then show the edit panel.
  function handleEdit(task: Task) {
    setActivePanel("edit")
    setEditingTaskId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDateInput,
    })
  }

  // Delete calls the database first, then removes the task from local UI state.
  async function handleDelete(taskId: string) {
    await deleteTask(taskId)

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    )

    if (editingTaskId === taskId) {
      resetForm()
    }
  }

  // Send only the task id. The Server Action reads the trusted current status
  // from PostgreSQL and returns the updated row.
  async function handleToggleComplete(taskId: string) {
    const updatedTask = await toggleTaskComplete(taskId)

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
    )
  }

  // Main dashboard render. This JSX controls what the user sees on `/tasks`:
  // page shell, back navigation, stats, add/edit controls, form, and task cards.
  return (
    <main className="min-h-svh bg-app-background bg-[radial-gradient(circle_at_top_left,rgba(251,191,117,0.08),transparent_32%)] px-6 py-8 text-app-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation includes the Clerk user menu so users can manage or end their session. */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-brand-primary"
          >
            <ArrowLeft className="size-4" />
            Back to landing page
          </Link>
          <UserButton />
        </div>

        {/* Header area: explains the dashboard and shows live stats from task state. */}
        <section className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-heading text-sm font-semibold tracking-[0.42em] text-brand-primary/90 uppercase">
              Database task workspace
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl font-light tracking-[0.08em] text-white uppercase sm:text-6xl">
              Your task command center
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-stone-200">
              Create, edit, complete, and delete tasks in PostgreSQL. Refresh
              the page and your tasks will still be here.
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
                  className="mt-2 w-full rounded-2xl border border-app-border bg-white/6 px-4 py-3 text-sm text-white transition outline-none placeholder:text-stone-500 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"
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
                  type="date"
                  className={`${fieldClass} mt-2`}
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      dueDate: event.target.value,
                    }))
                  }
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
                {formError ? (
                  <p className="mb-3 text-sm font-medium text-red-200">
                    {formError}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 rounded-full bg-brand-primary px-5 text-stone-950 hover:bg-brand-primary-hover"
                >
                  <Plus />
                  {isSaving
                    ? "Saving..."
                    : activePanel === "edit"
                      ? "Save changes"
                      : "Create task"}
                </Button>
              </div>
            </form>
          </section>
        ) : null}

        {/* Task grid: renders the sorted task list and wires each card to dashboard actions. */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {orderedTasks.length > 0 ? (
            orderedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onToggleComplete={handleToggleComplete}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-app-border bg-app-card p-6 text-stone-300 md:col-span-2">
              No tasks yet. Select Add Task to create your first database-backed
              task.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
