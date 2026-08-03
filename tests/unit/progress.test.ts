import { describe, expect, it } from "vitest"

import { getUtcDateKey, type DailyPlanView } from "@/lib/daily-plan"
import { getProgressMetrics, getUtcWeekStartTime } from "@/lib/tasks/progress"

type ProgressTask = Parameters<typeof getProgressMetrics>[0]["tasks"][number]

function task(overrides: Partial<ProgressTask> = {}): ProgressTask {
  return {
    id: "task-1",
    status: "Todo",
    dueDateInput: "",
    completedAt: "",
    ...overrides,
  }
}

function plan(overrides: Partial<DailyPlanView> = {}): DailyPlanView {
  return {
    id: "plan-1",
    summary: "Focus",
    planDate: "2026-08-03",
    generatedAt: "2026-08-03T08:00:00.000Z",
    items: [],
    ...overrides,
  }
}

describe("progress metrics", () => {
  const monday = new Date("2026-08-03T12:00:00.000Z")

  it("starts the UTC week on Monday at midnight", () => {
    expect(new Date(getUtcWeekStartTime(monday)).toISOString()).toBe(
      "2026-08-03T00:00:00.000Z"
    )
    expect(
      new Date(
        getUtcWeekStartTime(new Date("2026-08-09T23:59:59.000Z"))
      ).toISOString()
    ).toBe("2026-08-03T00:00:00.000Z")
  })

  it("changes the UTC date key exactly at midnight", () => {
    expect(getUtcDateKey(new Date("2026-08-02T23:59:59.999Z"))).toBe(
      "2026-08-02"
    )
    expect(getUtcDateKey(new Date("2026-08-03T00:00:00.000Z"))).toBe(
      "2026-08-03"
    )
  })

  it("counts active and overdue tasks against the supplied UTC date", () => {
    const metrics = getProgressMetrics({
      tasks: [
        task({ id: "past", dueDateInput: "2026-08-02" }),
        task({ id: "today", dueDateInput: "2026-08-03" }),
        task({ id: "future", dueDateInput: "2026-08-04" }),
        task({ id: "done", status: "Done", dueDateInput: "2026-08-01" }),
      ],
      dailyPlan: null,
      currentUtcDateKey: "2026-08-03",
      now: monday,
    })

    expect(metrics.activeCount).toBe(3)
    expect(metrics.overdueCount).toBe(1)
  })

  it("counts only trusted Done timestamps inside the current UTC week", () => {
    const metrics = getProgressMetrics({
      tasks: [
        task({
          id: "boundary",
          status: "Done",
          completedAt: "2026-08-03T00:00:00.000Z",
        }),
        task({
          id: "current",
          status: "Done",
          completedAt: "2026-08-03T11:59:59.000Z",
        }),
        task({
          id: "future",
          status: "Done",
          completedAt: "2026-08-03T12:00:01.000Z",
        }),
        task({
          id: "previous",
          status: "Done",
          completedAt: "2026-08-02T23:59:59.000Z",
        }),
        task({ id: "unknown", status: "Done", completedAt: "" }),
        task({
          id: "reopened",
          status: "Todo",
          completedAt: "2026-08-03T10:00:00.000Z",
        }),
      ],
      dailyPlan: null,
      currentUtcDateKey: "2026-08-03",
      now: monday,
    })

    expect(metrics.completedThisWeek).toBe(2)
  })

  it("ignores stale and missing plan items and follows live task status", () => {
    const tasks = [
      task({ id: "first" }),
      task({ id: "second", status: "Done" }),
    ]
    const currentPlan = plan({
      items: [
        { taskId: "first", position: 1, reason: "First" },
        { taskId: "second", position: 2, reason: "Second" },
        { taskId: "deleted", position: 3, reason: "Gone" },
      ],
    })
    const initial = getProgressMetrics({
      tasks,
      dailyPlan: currentPlan,
      currentUtcDateKey: "2026-08-03",
      now: monday,
    })
    const updated = getProgressMetrics({
      tasks: tasks.map((currentTask) =>
        currentTask.id === "first"
          ? { ...currentTask, status: "Done" }
          : currentTask
      ),
      dailyPlan: currentPlan,
      currentUtcDateKey: "2026-08-03",
      now: monday,
    })

    expect(initial).toMatchObject({
      currentPlanItemCount: 2,
      completedPlanItemCount: 1,
      focusPercentage: 50,
    })
    expect(updated.focusPercentage).toBe(100)
    expect(
      getProgressMetrics({
        tasks,
        dailyPlan: plan({ planDate: "2026-08-02" }),
        currentUtcDateKey: "2026-08-03",
        now: monday,
      }).hasCurrentPlan
    ).toBe(false)
  })
})
