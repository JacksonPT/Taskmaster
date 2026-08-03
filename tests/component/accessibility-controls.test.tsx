// @vitest-environment jsdom

import { type ReactNode, useState } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

const themeMocks = vi.hoisted(() => ({ setTheme: vi.fn() }))

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: "dark", setTheme: themeMocks.setTheme }),
}))

import { DailyPlanPanel } from "@/components/tasks/daily-plan-panel"
import type { Task } from "@/components/tasks/task-card"
import { ThemeProvider } from "@/components/theme-provider"

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

function DailyPlanHarness() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <DailyPlanPanel
      plan={{
        id: "plan-1",
        summary: "Focus",
        planDate: "2026-08-03",
        generatedAt: "2026-08-03T12:00:00.000Z",
        items: [{ taskId: task.id, position: 1, reason: "First" }],
      }}
      tasks={[task]}
      isCollapsed={isCollapsed}
      isReordering={false}
      onToggleCollapsed={() => setIsCollapsed((current) => !current)}
      onMove={vi.fn()}
    />
  )
}

describe("global and sidebar accessibility controls", () => {
  it("does not change theme from an unmodified character key", () => {
    render(
      <ThemeProvider>
        <button type="button">Visible control</button>
      </ThemeProvider>
    )

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "d" }))

    expect(themeMocks.setTheme).not.toHaveBeenCalled()
    expect(
      screen.getByRole("button", { name: "Visible control" })
    ).toBeEnabled()
  })

  it("moves focus between replacement sidebar controls", async () => {
    const user = userEvent.setup()
    render(<DailyPlanHarness />)

    expect(
      screen.getByRole("button", { name: `Move ${task.title} up` })
    ).toBeDisabled()
    expect(
      screen.getByRole("button", { name: `Move ${task.title} down` })
    ).toBeDisabled()

    await user.click(
      screen.getByRole("button", { name: "Collapse daily plan" })
    )
    const expand = screen.getByRole("button", { name: "Expand daily plan" })
    await waitFor(() => expect(expand).toHaveFocus())

    await user.click(expand)
    const collapse = screen.getByRole("button", { name: "Collapse daily plan" })
    await waitFor(() => expect(collapse).toHaveFocus())
  })
})
