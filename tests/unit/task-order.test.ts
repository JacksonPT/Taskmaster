import { describe, expect, it } from "vitest"

import { orderTasksForWorkspace } from "@/lib/tasks/order"

type OrderedTask = Parameters<typeof orderTasksForWorkspace>[0][number]

function task(
  id: string,
  priority: OrderedTask["priority"],
  status = "Todo"
): OrderedTask {
  return { id, priority, status }
}

describe("workspace task ordering", () => {
  it("uses focus positions before priority for active tasks", () => {
    const tasks = [task("high", "High"), task("low", "Low")]
    const positions = new Map([
      ["low", 1],
      ["high", 2],
    ])

    expect(
      orderTasksForWorkspace(tasks, positions).map(({ id }) => id)
    ).toEqual(["low", "high"])
  })

  it("uses priority for unplanned active tasks and keeps completed tasks last", () => {
    const tasks = [
      task("done", "High", "Done"),
      task("low", "Low"),
      task("medium", "Medium"),
      task("high", "High"),
    ]

    expect(
      orderTasksForWorkspace(tasks, new Map()).map(({ id }) => id)
    ).toEqual(["high", "medium", "low", "done"])
  })

  it("preserves input order for equal active and completed ranks", () => {
    const tasks = [
      task("first", "Medium"),
      task("second", "Medium"),
      task("done-first", "Low", "Done"),
      task("done-second", "High", "Done"),
    ]

    expect(
      orderTasksForWorkspace(tasks, new Map()).map(({ id }) => id)
    ).toEqual(tasks.map(({ id }) => id))
  })

  it("keeps a newly created unplanned task in priority fallback", () => {
    const tasks = [task("planned", "Low"), task("new", "High")]

    expect(
      orderTasksForWorkspace(tasks, new Map([["planned", 1]])).map(
        ({ id }) => id
      )
    ).toEqual(["planned", "new"])
  })
})
