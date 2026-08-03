// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const actionMocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  toggleTaskComplete: vi.fn(),
  updateTask: vi.fn(),
  createDailyPlan: vi.fn(),
  createTaskCompletionPlan: vi.fn(),
  reorderDailyPlan: vi.fn(),
  suggestTaskPriority: vi.fn(),
}))

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <button type="button">User menu</button>,
}))
vi.mock("@/app/tasks/actions", () => ({
  createTask: actionMocks.createTask,
  deleteTask: actionMocks.deleteTask,
  toggleTaskComplete: actionMocks.toggleTaskComplete,
  updateTask: actionMocks.updateTask,
}))
vi.mock("@/app/tasks/ai-actions", () => ({
  createDailyPlan: actionMocks.createDailyPlan,
  createTaskCompletionPlan: actionMocks.createTaskCompletionPlan,
  reorderDailyPlan: actionMocks.reorderDailyPlan,
  suggestTaskPriority: actionMocks.suggestTaskPriority,
}))

import { TaskDashboard } from "@/components/tasks/task-dashboard"
import type { Task } from "@/components/tasks/task-card"
import type { DailyPlanState } from "@/lib/daily-plan"

const task: Task = {
  id: "task-1",
  title: "Plan release",
  description: "Confirm the checklist.",
  priority: "High",
  status: "Todo",
  dueDate: "Aug 3, 2026",
  dueDateInput: "2026-08-03",
  completedAt: "",
  priorityReason: "Deadline",
  aiSuggestion: "",
  aiSteps: [],
}

function renderDashboard(
  initialTasks: Task[] = [task],
  initialDailyPlanState: DailyPlanState = {
    plan: null,
    usageDate: "2026-08-03",
    generationsUsedToday: 0,
  }
) {
  render(
    <TaskDashboard
      initialTasks={initialTasks}
      initialDailyPlanState={initialDailyPlanState}
    />
  )
}

describe("dashboard lifecycle failure state", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("prevents duplicate deletion and preserves the task after failure", async () => {
    let resolveDelete: (value: {
      success: false
      message: string
    }) => void = () => {}
    actionMocks.deleteTask.mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = resolve
      })
    )
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole("button", { name: "Delete" }))

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled()
    expect(actionMocks.deleteTask).toHaveBeenCalledOnce()

    resolveDelete({
      success: false,
      message: "Could not delete the task. Try again.",
    })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not delete the task. Try again."
    )
    expect(screen.getByRole("heading", { name: task.title })).toBeVisible()
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled()
  })

  it("keeps active state and suppresses celebration after toggle failure", async () => {
    actionMocks.toggleTaskComplete.mockResolvedValue({
      success: false,
      message: "Could not update the task. Try again.",
    })
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole("button", { name: "Complete" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not update the task. Try again."
    )
    expect(screen.getByText("Todo")).toBeVisible()
    expect(screen.queryByText("Task Complete!")).toBeNull()
    expect(screen.getByRole("button", { name: "Complete" })).toBeEnabled()
  })

  it("announces rejected completion generation without rendering output", async () => {
    actionMocks.createTaskCompletionPlan.mockResolvedValue({
      success: false,
      message: "Could not generate a completion plan. Try again shortly.",
    })
    const user = userEvent.setup()
    renderDashboard()

    await user.click(
      screen.getByRole("button", { name: "Generate action plan" })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not generate a completion plan. Try again shortly."
    )
    expect(screen.queryByText("AI completion plan")).toBeNull()
    expect(
      screen.getByRole("button", { name: "Generate action plan" })
    ).toBeEnabled()
  })

  it("retains the committed daily-plan order when reorder fails", async () => {
    const secondTask = { ...task, id: "task-2", title: "Publish release" }
    actionMocks.reorderDailyPlan.mockResolvedValue({
      success: false,
      message: "Could not save the new task order. Try again shortly.",
    })
    const user = userEvent.setup()
    renderDashboard([task, secondTask], {
      plan: {
        id: "plan-1",
        summary: "Focus",
        planDate: "2026-08-03",
        generatedAt: "2026-08-03T12:00:00.000Z",
        items: [
          { taskId: task.id, position: 1, reason: "First" },
          { taskId: secondTask.id, position: 2, reason: "Second" },
        ],
      },
      usageDate: "2026-08-03",
      generationsUsedToday: 1,
    })

    await user.click(
      screen.getByRole("button", { name: `Move ${task.title} down` })
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save the new task order. Try again shortly."
    )
    const planList = screen.getByRole("list")
    const planTitles = within(planList)
      .getAllByText(/Plan release|Publish release/)
      .map((element) => element.textContent)
    expect(planTitles).toEqual(["Plan release", "Publish release"])
  })

  it("moves focus into the add form and restores it after cancel", async () => {
    const user = userEvent.setup()
    renderDashboard()
    const addButton = screen.getByRole("button", { name: "Add Task" })

    await user.click(addButton)

    expect(screen.getByLabelText("Title")).toHaveFocus()
    expect(screen.getByLabelText("Title")).toBeRequired()
    expect(screen.getByLabelText("Description")).toBeRequired()

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(addButton).toHaveFocus())
  })

  it("associates server field errors and restores the edit trigger", async () => {
    actionMocks.updateTask.mockResolvedValue({
      success: false,
      message: "Check the highlighted task details and try again.",
      fieldErrors: { title: ["Enter a valid title."] },
    })
    const user = userEvent.setup()
    renderDashboard()
    const editButton = screen.getByRole("button", { name: "Edit" })

    await user.click(editButton)
    const title = screen.getByLabelText("Title")
    expect(title).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check the highlighted task details and try again."
    )
    expect(title).toHaveAttribute("aria-invalid", "true")
    expect(title).toHaveAccessibleDescription("Enter a valid title.")

    await user.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(editButton).toHaveFocus())
  })
})
