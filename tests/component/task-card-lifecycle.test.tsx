// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TaskCard, type Task } from "@/components/tasks/task-card"

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

function renderCard(overrides: Partial<Parameters<typeof TaskCard>[0]> = {}) {
  render(
    <TaskCard
      task={task}
      onDelete={vi.fn()}
      onEdit={vi.fn()}
      onGeneratePlan={vi.fn()}
      onToggleComplete={vi.fn()}
      isGeneratingPlan={false}
      isPlanActionDisabled={false}
      pendingAction={null}
      taskActionError={null}
      planError={null}
      {...overrides}
    />
  )
}

describe("task lifecycle feedback", () => {
  it("disables duplicate card actions while deletion is pending", () => {
    renderCard({ pendingAction: "delete" })

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled()
  })

  it("announces a lifecycle failure without showing success feedback", () => {
    renderCard({ taskActionError: "Could not update the task. Try again." })

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not update the task. Try again."
    )
    expect(screen.queryByText("Task Complete!")).toBeNull()
    expect(screen.getByRole("heading", { name: task.title })).toBeVisible()
  })

  it("prevents duplicate AI actions while generation is pending", () => {
    renderCard({ isGeneratingPlan: true, isPlanActionDisabled: true })

    expect(
      screen.getByRole("button", { name: "Building plan..." })
    ).toBeDisabled()
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled()
    expect(screen.queryByText("AI completion plan")).toBeNull()
  })
})
