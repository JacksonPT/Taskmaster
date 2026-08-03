// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import TasksError from "@/app/tasks/error"

describe("task route error recovery", () => {
  it("shows safe retry UI without rendering unexpected error details", async () => {
    const retry = vi.fn()
    const user = userEvent.setup()

    render(
      <TasksError
        error={new Error("DATABASE_URL secret query detail")}
        unstable_retry={retry}
      />
    )

    expect(
      screen.getByRole("heading", { name: "We could not load your tasks" })
    ).toBeVisible()
    expect(screen.queryByText(/database_url|secret|query detail/i)).toBeNull()

    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
