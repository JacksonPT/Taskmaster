"use client"

// This component needs state, effects, and event handlers, so it must be a Client Component.
import { type FormEvent, useEffect, useRef, useState } from "react"
import { ArrowLeft, LoaderCircle, Plus, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

import {
  createTask,
  deleteTask,
  toggleTaskComplete,
  updateTask,
} from "@/app/tasks/actions"
import {
  createDailyPlan,
  createTaskCompletionPlan,
  reorderDailyPlan,
  suggestTaskPriority,
} from "@/app/tasks/ai-actions"
import { TaskmasterMark } from "@/components/taskmaster-mark"
import { DailyPlanPanel } from "@/components/tasks/daily-plan-panel"
import { ProgressDashboard } from "@/components/tasks/progress-dashboard"
import {
  TaskCard,
  type Task,
  type TaskPriority,
} from "@/components/tasks/task-card"
import { Button } from "@/components/ui/button"
import {
  getUtcDateKey,
  MAX_DAILY_PLAN_GENERATIONS,
  type DailyPlanState,
  type DailyPlanView,
} from "@/lib/daily-plan"
import { orderTasksForWorkspace } from "@/lib/tasks/order"
import { cn } from "@/lib/utils"

type TaskFormState = {
  title: string
  description: string
  priority: TaskPriority
  priorityReason: string
  dueDate: string
}

// This tracks which form panel should be visible. null means no form is open.
type ActivePanel = "add" | "edit" | null
type TaskLifecycleAction = "delete" | "toggle"
type TaskFormErrors = Partial<Record<keyof TaskFormState, string>>

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  priority: "Medium",
  priorityReason: "",
  dueDate: "",
}

// Shared field classes keep inputs/selects visually consistent.
const fieldClass =
  "w-full rounded-2xl border border-app-border bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"

type TaskDashboardProps = {
  initialTasks: Task[]
  initialDailyPlanState: DailyPlanState
}

export function TaskDashboard({
  initialTasks,
  initialDailyPlanState,
}: TaskDashboardProps) {
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
  const [formFieldErrors, setFormFieldErrors] = useState<TaskFormErrors>({})
  const addTaskButtonRef = useRef<HTMLButtonElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const panelReturnFocusRef = useRef<HTMLButtonElement | null>(null)

  // AI requests have independent loading/error state because suggesting and
  // saving are separate server operations.
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  // Completion plans belong to saved task cards, so their async state identifies
  // which card is running and which card should display a returned error.
  const [generatingTaskId, setGeneratingTaskId] = useState<string | null>(null)
  const [planError, setPlanError] = useState<{
    taskId: string
    message: string
  } | null>(null)
  const [pendingTaskActions, setPendingTaskActions] = useState<
    Record<string, TaskLifecycleAction>
  >({})
  const [taskActionErrors, setTaskActionErrors] = useState<
    Record<string, string>
  >({})

  // The daily plan is a persisted snapshot. Its generation counter is separate
  // so manual reordering never consumes or resets AI allowance.
  const [dailyPlan, setDailyPlan] = useState<DailyPlanView | null>(
    initialDailyPlanState.plan
  )
  // The dashboard owns collapse state because it changes both the panel and the
  // width allocated to the surrounding task/sidebar layout.
  const [isDailyPlanCollapsed, setIsDailyPlanCollapsed] = useState(false)
  const [generationsUsedToday, setGenerationsUsedToday] = useState(
    initialDailyPlanState.generationsUsedToday
  )
  const [dailyUsageDate, setDailyUsageDate] = useState(
    initialDailyPlanState.usageDate
  )
  const [isPlanningDay, setIsPlanningDay] = useState(false)
  const [isReorderingDailyPlan, setIsReorderingDailyPlan] = useState(false)
  const [dailyPlanError, setDailyPlanError] = useState<string | null>(null)

  // This key is ephemeral UI state, not task data. Incrementing it remounts the
  // celebration so each trusted completion can run a fresh animation.
  const [completionCelebrationId, setCompletionCelebrationId] = useState(0)

  useEffect(() => {
    if (completionCelebrationId === 0) {
      return
    }

    // Animation events normally remove the overlay. This keyed timeout is a
    // fallback for interrupted CSS or browser events, so it can never stick.
    const activeCelebrationId = completionCelebrationId
    const timeoutId = window.setTimeout(() => {
      setCompletionCelebrationId((currentId) =>
        currentId === activeCelebrationId ? 0 : currentId
      )
    }, 1600)

    return () => window.clearTimeout(timeoutId)
  }, [completionCelebrationId])

  // Keep a long-open tab usable when the server-enforced UTC allowance resets.
  // The server still performs the authoritative check on every generation.
  useEffect(() => {
    const now = new Date()
    const nextUtcMidnight = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1
    )
    const timeoutId = window.setTimeout(
      () => {
        setDailyUsageDate(getUtcDateKey())
        setGenerationsUsedToday(0)
        setDailyPlanError(null)
      },
      nextUtcMidnight - now.getTime() + 1000
    )

    return () => window.clearTimeout(timeoutId)
  }, [dailyUsageDate])

  useEffect(() => {
    if (activePanel) {
      titleInputRef.current?.focus()
      return
    }

    const returnFocus = panelReturnFocusRef.current

    if (returnFocus) {
      const target = returnFocus.isConnected
        ? returnFocus
        : addTaskButtonRef.current
      target?.focus()
      panelReturnFocusRef.current = null
    }
  }, [activePanel])

  // These stats are derived from state, so they update automatically after every task action.
  const completedCount = tasks.filter((task) => task.status === "Done").length
  const activeCount = tasks.length - completedCount
  const currentUsageDate = getUtcDateKey()
  // Comparing date keys during every render also covers hydration or an
  // in-flight response that crosses UTC midnight before the timer runs.
  const effectiveGenerationsUsed =
    dailyUsageDate === currentUsageDate ? generationsUsedToday : 0
  const remainingDailyGenerations = Math.max(
    0,
    MAX_DAILY_PLAN_GENERATIONS - effectiveGenerationsUsed
  )
  const dailyPlanPositions = new Map(
    dailyPlan?.items.map((item, index) => [item.taskId, index + 1]) ?? []
  )

  const orderedTasks = orderTasksForWorkspace(tasks, dailyPlanPositions)

  // Resetting means closing any panel and clearing the form back to default values.
  function resetForm() {
    setForm(emptyForm)
    setFormError(null)
    setFormFieldErrors({})
    setSuggestionError(null)
    setActivePanel(null)
    setEditingTaskId(null)
  }

  // Opening add clears any existing edit state so add/edit panels stay mutually exclusive.
  function openAddPanel(trigger: HTMLButtonElement) {
    panelReturnFocusRef.current = trigger
    setForm(emptyForm)
    setFormError(null)
    setFormFieldErrors({})
    setSuggestionError(null)
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
      setFormFieldErrors({
        title: title ? undefined : "Enter a task title.",
        description: description ? undefined : "Enter a task description.",
      })
      return
    }

    setIsSaving(true)
    setFormError(null)
    setFormFieldErrors({})

    //EDIT SUBMIT
    // If the edit panel is active, update the matching task instead of creating a new one.
    if (activePanel === "edit" && editingTaskId) {
      try {
        const result = await updateTask(editingTaskId, {
          title,
          description,
          priority: form.priority,
          priorityReason: form.priorityReason,
          dueDate: form.dueDate,
        })

        if (!result.success) {
          setFormError(result.message)
          setFormFieldErrors({
            title: result.fieldErrors?.title?.[0],
            description: result.fieldErrors?.description?.[0],
            priority: result.fieldErrors?.priority?.[0],
            dueDate: result.fieldErrors?.dueDate?.[0],
          })
          return
        }

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTaskId ? result.task : task
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
      const result = await createTask({
        title,
        description,
        priority: form.priority,
        priorityReason: form.priorityReason,
        dueDate: form.dueDate,
      })

      if (!result.success) {
        setFormError(result.message)
        setFormFieldErrors({
          title: result.fieldErrors?.title?.[0],
          description: result.fieldErrors?.description?.[0],
          priority: result.fieldErrors?.priority?.[0],
          dueDate: result.fieldErrors?.dueDate?.[0],
        })
        return
      }

      // Add the returned database row at the top of the list so it appears immediately.
      setTasks((currentTasks) => [result.task, ...currentTasks])

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
  function handleEdit(task: Task, trigger: HTMLButtonElement) {
    panelReturnFocusRef.current = trigger
    setPlanError(null)
    setFormError(null)
    setFormFieldErrors({})
    setActivePanel("edit")
    setEditingTaskId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      priorityReason: task.priorityReason,
      dueDate: task.dueDateInput,
    })
  }

  // React sends only bounded form data to an authenticated Server Action.
  // The returned object has already passed Gemini structured output and Zod validation.
  async function handleSuggestPriority() {
    if (!form.title.trim() || !form.description.trim()) {
      setSuggestionError("Enter a title and description first.")
      return
    }

    setIsSuggesting(true)
    setSuggestionError(null)

    try {
      const result = await suggestTaskPriority({
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
      })

      if (!result.success) {
        setSuggestionError(result.message)
        return
      }

      setForm((currentForm) => ({
        ...currentForm,
        priority: result.suggestion.priority,
        priorityReason: result.suggestion.explanation,
      }))
    } catch {
      setSuggestionError("Could not request a suggestion. Try again shortly.")
    } finally {
      setIsSuggesting(false)
    }
  }

  // The browser submits only the id. The Server Action reloads the owned task
  // from PostgreSQL, calls Gemini once, persists the plan, and returns its fields.
  async function handleGeneratePlan(taskId: string) {
    setGeneratingTaskId(taskId)
    setPlanError(null)

    try {
      const result = await createTaskCompletionPlan(taskId)

      if (!result.success) {
        setPlanError({ taskId, message: result.message })
        return
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                aiSuggestion: result.plan.summary,
                aiSteps: result.plan.steps,
              }
            : task
        )
      )
    } catch {
      setPlanError({
        taskId,
        message: "Could not request a completion plan. Try again shortly.",
      })
    } finally {
      setGeneratingTaskId(null)
    }
  }

  // One click sends no task data. The Server Action loads every active owned
  // task, reserves one of today's two calls, and returns the persisted plan.
  async function handleCreateDailyPlan() {
    setIsPlanningDay(true)
    setDailyPlanError(null)

    try {
      const result = await createDailyPlan()

      if (!result.success) {
        setDailyPlanError(result.message)

        if (result.usageDate !== undefined) {
          setDailyUsageDate(result.usageDate)
        }

        if (result.generationsUsedToday !== undefined) {
          setGenerationsUsedToday(result.generationsUsedToday)
        }
        return
      }

      setDailyPlan(result.plan)
      setDailyUsageDate(result.usageDate)
      setGenerationsUsedToday(result.generationsUsedToday)
    } catch {
      setDailyPlanError("Could not request a daily plan. Try again shortly.")
    } finally {
      setIsPlanningDay(false)
    }
  }

  // Move one item by swapping ids, then let the server rebuild positions from
  // trusted stored reasons. This path does not call Gemini.
  async function handleMoveDailyTask(taskId: string, direction: "up" | "down") {
    if (!dailyPlan) {
      return
    }

    const currentIndex = dailyPlan.items.findIndex(
      (item) => item.taskId === taskId
    )
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (
      currentIndex === -1 ||
      nextIndex < 0 ||
      nextIndex >= dailyPlan.items.length
    ) {
      return
    }

    const reorderedItems = [...dailyPlan.items]
    const movedItem = reorderedItems[currentIndex]
    reorderedItems[currentIndex] = reorderedItems[nextIndex]
    reorderedItems[nextIndex] = movedItem

    setIsReorderingDailyPlan(true)
    setDailyPlanError(null)

    try {
      const result = await reorderDailyPlan(
        reorderedItems.map((item) => item.taskId)
      )

      if (!result.success) {
        setDailyPlanError(result.message)
        return
      }

      setDailyPlan((currentPlan) =>
        currentPlan
          ? {
              ...currentPlan,
              items: result.items,
            }
          : null
      )
    } catch {
      setDailyPlanError("Could not save the new task order. Try again.")
    } finally {
      setIsReorderingDailyPlan(false)
    }
  }

  // Delete calls the database first, then removes the task from local UI state.
  async function handleDelete(taskId: string) {
    if (pendingTaskActions[taskId]) {
      return
    }

    setPendingTaskActions((current) => ({ ...current, [taskId]: "delete" }))
    setTaskActionErrors((current) => {
      const next = { ...current }
      delete next[taskId]
      return next
    })

    try {
      const result = await deleteTask(taskId)

      if (!result.success) {
        setTaskActionErrors((current) => ({
          ...current,
          [taskId]: result.message,
        }))
        return
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      )
      setDailyPlan((currentPlan) => {
        if (!currentPlan) {
          return null
        }

        const remainingItems = currentPlan.items.filter(
          (item) => item.taskId !== taskId
        )

        return remainingItems.length > 0
          ? { ...currentPlan, items: remainingItems }
          : null
      })

      if (editingTaskId === taskId) {
        resetForm()
      }

      if (planError?.taskId === taskId) {
        setPlanError(null)
      }
    } catch {
      setTaskActionErrors((current) => ({
        ...current,
        [taskId]:
          "Could not delete the task. Check your connection and try again.",
      }))
    } finally {
      setPendingTaskActions((current) => {
        const next = { ...current }
        delete next[taskId]
        return next
      })
    }
  }

  // Send only the task id. The Server Action reads the trusted current status
  // from PostgreSQL and returns the updated row.
  async function handleToggleComplete(taskId: string) {
    if (pendingTaskActions[taskId]) {
      return
    }

    setPendingTaskActions((current) => ({ ...current, [taskId]: "toggle" }))
    setTaskActionErrors((current) => {
      const next = { ...current }
      delete next[taskId]
      return next
    })

    try {
      const result = await toggleTaskComplete(taskId)

      if (!result.success) {
        setTaskActionErrors((current) => ({
          ...current,
          [taskId]: result.message,
        }))
        return
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? result.task : task))
      )

      // Celebrate only the database-backed result. Reopens and failed actions
      // never return a successful Done state and therefore cannot trigger it.
      if (result.task.status === "Done") {
        setCompletionCelebrationId((currentId) => currentId + 1)
      }
    } catch {
      setTaskActionErrors((current) => ({
        ...current,
        [taskId]:
          "Could not update the task. Check your connection and try again.",
      }))
    } finally {
      setPendingTaskActions((current) => {
        const next = { ...current }
        delete next[taskId]
        return next
      })
    }
  }

  // Main dashboard render. This JSX controls what the user sees on `/tasks`:
  // page shell, back navigation, stats, add/edit controls, form, and task cards.
  return (
    <main className="min-h-svh bg-app-background bg-[radial-gradient(circle_at_top_left,rgba(251,191,117,0.08),transparent_32%)] px-6 py-8 text-app-foreground sm:px-8 lg:px-12">
      {completionCelebrationId > 0 ? (
        <div
          key={completionCelebrationId}
          className="pointer-events-none fixed inset-0 z-50 grid animate-[task-completion-overlay_1500ms_ease-out_both] place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(254,243,199,0.88)_0%,rgba(251,191,117,0.52)_38%,rgba(7,11,16,0.58)_100%)] px-6 text-center motion-reduce:animate-[task-completion-overlay-reduced_1500ms_ease_both]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          onAnimationEnd={(event) => {
            // Ignore the nested text animation so only the overlay's lifecycle
            // clears the current instance; a newer keyed celebration survives.
            if (event.target !== event.currentTarget) {
              return
            }

            setCompletionCelebrationId((currentId) =>
              currentId === completionCelebrationId ? 0 : currentId
            )
          }}
        >
          <p className="animate-[task-completion-message_1500ms_cubic-bezier(0.22,1,0.36,1)_both] font-heading text-4xl font-semibold tracking-[0.12em] text-amber-50 uppercase drop-shadow-[0_4px_24px_rgba(7,11,16,0.9)] motion-reduce:animate-[task-completion-message-reduced_1500ms_ease_both] sm:text-6xl lg:text-7xl">
            Task Complete!
          </p>
        </div>
      ) : null}

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

        <section className="mt-8">
          <div className="flex items-center justify-between gap-6">
            <h1 className="font-heading text-4xl font-light tracking-[0.12em] text-white uppercase sm:text-5xl">
              Command Center
            </h1>
            <Link
              href="/"
              aria-label="Return to Taskmaster landing page"
              className="shrink-0 rounded-full transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-app-background focus-visible:outline-none"
            >
              <TaskmasterMark className="size-16 drop-shadow-[0_0_24px_rgba(251,191,117,0.2)] sm:size-20" />
            </Link>
          </div>

          {/* The metric ribbon spans the workspace, then wraps from four to two
              to one column before any cell becomes too narrow to scan. */}
          <div className="mt-6">
            <ProgressDashboard
              tasks={tasks}
              dailyPlan={dailyPlan}
              currentUtcDateKey={currentUsageDate}
            />
          </div>
        </section>

        {/* Task controls: opens the create panel without showing the form by default. */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-heading text-xs font-semibold tracking-[0.3em] text-brand-soft uppercase">
              Manage tasks
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Select Add Task to create a new task
            </h2>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap gap-3">
              <Button
                ref={addTaskButtonRef}
                type="button"
                variant="outline"
                disabled={
                  isPlanningDay ||
                  generatingTaskId !== null ||
                  activeCount === 0 ||
                  remainingDailyGenerations === 0
                }
                className="h-11 rounded-full border-sky-200/25 bg-sky-300/10 px-5 text-sky-50 hover:bg-sky-300/20"
                onClick={handleCreateDailyPlan}
              >
                {isPlanningDay ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                {isPlanningDay
                  ? "Planning..."
                  : remainingDailyGenerations === 0
                    ? "Daily limit reached"
                    : dailyPlan?.planDate === currentUsageDate
                      ? "Regenerate daily plan"
                      : "Plan my day"}
              </Button>
              <Button
                type="button"
                className="h-11 rounded-full bg-brand-primary px-5 text-stone-950 hover:bg-brand-primary-hover"
                onClick={(event) => openAddPanel(event.currentTarget)}
              >
                <Plus />
                Add Task
              </Button>
            </div>
            <p className="text-xs text-stone-500">
              {remainingDailyGenerations} of {MAX_DAILY_PLAN_GENERATIONS} daily
              plan generations remaining until 00:00 UTC
            </p>
          </div>
        </div>

        {dailyPlanError ? (
          <p className="mt-4 text-sm font-medium text-red-200" role="alert">
            {dailyPlanError}
          </p>
        ) : null}

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
                onClick={() => resetForm()}
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
              <label className="lg:col-span-2" htmlFor="task-title">
                <span className="text-sm font-medium text-stone-300">
                  Title
                </span>
                <input
                  ref={titleInputRef}
                  id="task-title"
                  className="mt-2 w-full rounded-2xl border border-app-border bg-white/6 px-4 py-3 text-sm text-white transition outline-none placeholder:text-stone-500 focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"
                  value={form.title}
                  maxLength={120}
                  required
                  aria-invalid={Boolean(formFieldErrors.title)}
                  aria-describedby={
                    formFieldErrors.title ? "task-title-error" : undefined
                  }
                  onChange={(event) => {
                    setForm((currentForm) => ({
                      ...currentForm,
                      title: event.target.value,
                      // Input changes invalidate the explanation generated from old data.
                      priorityReason: "",
                    }))
                    setFormFieldErrors((current) => ({
                      ...current,
                      title: undefined,
                    }))
                    setSuggestionError(null)
                  }}
                  placeholder="Example: Finish project proposal"
                />
                {formFieldErrors.title ? (
                  <span
                    id="task-title-error"
                    className="mt-2 block text-xs font-medium text-red-200"
                  >
                    {formFieldErrors.title}
                  </span>
                ) : null}
              </label>

              <label htmlFor="task-priority">
                <span className="text-sm font-medium text-stone-300">
                  Priority
                </span>
                <select
                  id="task-priority"
                  className={`${fieldClass} mt-2`}
                  value={form.priority}
                  aria-invalid={Boolean(formFieldErrors.priority)}
                  aria-describedby={
                    formFieldErrors.priority ? "task-priority-error" : undefined
                  }
                  onChange={(event) => {
                    setForm((currentForm) => ({
                      ...currentForm,
                      priority: event.target.value as TaskPriority,
                      // Manual override keeps the human in control and clears stale AI rationale.
                      priorityReason: "",
                    }))
                    setFormFieldErrors((current) => ({
                      ...current,
                      priority: undefined,
                    }))
                    setSuggestionError(null)
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {formFieldErrors.priority ? (
                  <span
                    id="task-priority-error"
                    className="mt-2 block text-xs font-medium text-red-200"
                  >
                    {formFieldErrors.priority}
                  </span>
                ) : null}
              </label>

              <label htmlFor="task-due-date">
                <span className="text-sm font-medium text-stone-300">
                  Due date
                </span>
                <input
                  id="task-due-date"
                  type="date"
                  className={`${fieldClass} mt-2`}
                  value={form.dueDate}
                  aria-invalid={Boolean(formFieldErrors.dueDate)}
                  aria-describedby={
                    formFieldErrors.dueDate ? "task-due-date-error" : undefined
                  }
                  onChange={(event) => {
                    setForm((currentForm) => ({
                      ...currentForm,
                      dueDate: event.target.value,
                      priorityReason: "",
                    }))
                    setFormFieldErrors((current) => ({
                      ...current,
                      dueDate: undefined,
                    }))
                    setSuggestionError(null)
                  }}
                />
                {formFieldErrors.dueDate ? (
                  <span
                    id="task-due-date-error"
                    className="mt-2 block text-xs font-medium text-red-200"
                  >
                    {formFieldErrors.dueDate}
                  </span>
                ) : null}
              </label>

              <label className="lg:col-span-4" htmlFor="task-description">
                <span className="text-sm font-medium text-stone-300">
                  Description
                </span>
                <textarea
                  id="task-description"
                  className={`${fieldClass} mt-2 min-h-28 resize-y`}
                  value={form.description}
                  maxLength={1000}
                  required
                  aria-invalid={Boolean(formFieldErrors.description)}
                  aria-describedby={
                    formFieldErrors.description
                      ? "task-description-error"
                      : undefined
                  }
                  onChange={(event) => {
                    setForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                      priorityReason: "",
                    }))
                    setFormFieldErrors((current) => ({
                      ...current,
                      description: undefined,
                    }))
                    setSuggestionError(null)
                  }}
                  placeholder="What needs to happen?"
                />
                {formFieldErrors.description ? (
                  <span
                    id="task-description-error"
                    className="mt-2 block text-xs font-medium text-red-200"
                  >
                    {formFieldErrors.description}
                  </span>
                ) : null}
              </label>

              <div className="rounded-2xl border border-violet-200/20 bg-violet-300/6 p-4 lg:col-span-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-violet-100 uppercase">
                      <Sparkles className="size-4" />
                      Gemini priority suggestion
                    </p>
                    <p className="mt-2 text-sm text-stone-400">
                      Gemini returns a validated priority and rationale. You can
                      override it before saving.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSuggesting || isSaving}
                    className="rounded-full border-violet-200/25 bg-violet-200/10 text-violet-50 hover:bg-violet-200/20"
                    onClick={handleSuggestPriority}
                  >
                    <Sparkles />
                    {isSuggesting ? "Thinking..." : "Suggest priority"}
                  </Button>
                </div>

                {form.priorityReason ? (
                  <p className="mt-4 text-sm leading-6 text-stone-200">
                    <span className="font-semibold text-violet-100">
                      Suggested {form.priority}:
                    </span>{" "}
                    {form.priorityReason}
                  </p>
                ) : null}

                {suggestionError ? (
                  <p
                    className="mt-4 text-sm font-medium text-red-200"
                    role="alert"
                  >
                    {suggestionError}
                  </p>
                ) : null}
              </div>

              <div className="lg:col-span-4">
                {formError ? (
                  <p
                    className="mb-3 text-sm font-medium text-red-200"
                    role="alert"
                  >
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

        {/* The plan comes first in source and grid order so visual, keyboard,
            and reading order agree. The parent owns its changing column width. */}
        <div
          className={cn(
            "mt-12 grid gap-6 transition-[grid-template-columns] duration-300",
            dailyPlan &&
              (isDailyPlanCollapsed
                ? "xl:grid-cols-[5rem_minmax(0,1fr)]"
                : "xl:grid-cols-[22rem_minmax(0,1fr)]")
          )}
        >
          {dailyPlan ? (
            <aside className="min-w-0 xl:sticky xl:top-8 xl:max-h-[calc(100svh-4rem)] xl:self-start xl:overflow-y-auto">
              <DailyPlanPanel
                plan={dailyPlan}
                tasks={tasks}
                isCollapsed={isDailyPlanCollapsed}
                isReordering={isReorderingDailyPlan}
                onToggleCollapsed={() =>
                  setIsDailyPlanCollapsed((isCollapsed) => !isCollapsed)
                }
                onMove={handleMoveDailyTask}
              />
            </aside>
          ) : null}

          {/* Task grid: renders the sorted task list and wires each card to dashboard actions. */}
          <section className="grid min-w-0 gap-6 md:grid-cols-2">
            {orderedTasks.length > 0 ? (
              orderedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onGeneratePlan={handleGeneratePlan}
                  onToggleComplete={handleToggleComplete}
                  isGeneratingPlan={generatingTaskId === task.id}
                  isPlanActionDisabled={
                    generatingTaskId !== null || isPlanningDay
                  }
                  pendingAction={pendingTaskActions[task.id] ?? null}
                  taskActionError={taskActionErrors[task.id] ?? null}
                  planError={
                    planError?.taskId === task.id ? planError.message : null
                  }
                  focusPosition={dailyPlanPositions.get(task.id)}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-app-border bg-app-card p-6 text-stone-300 md:col-span-2">
                No tasks yet. Select Add Task to create your first
                database-backed task.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
