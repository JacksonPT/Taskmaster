type OrderedTask = {
  id: string
  status: string
  priority: "High" | "Medium" | "Low"
}

const priorityRank: Record<OrderedTask["priority"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
}

export function orderTasksForWorkspace<T extends OrderedTask>(
  tasks: T[],
  dailyPlanPositions: ReadonlyMap<string, number>
) {
  // A saved focus position wins for active tasks. Unplanned active tasks use
  // deterministic priority order, and completed tasks remain last.
  return [...tasks].sort((taskA, taskB) => {
    const completionDifference =
      Number(taskA.status === "Done") - Number(taskB.status === "Done")

    if (completionDifference !== 0) {
      return completionDifference
    }

    if (taskA.status === "Done" && taskB.status === "Done") {
      return 0
    }

    const dailyPositionA =
      dailyPlanPositions.get(taskA.id) ?? Number.MAX_SAFE_INTEGER
    const dailyPositionB =
      dailyPlanPositions.get(taskB.id) ?? Number.MAX_SAFE_INTEGER

    if (dailyPositionA !== dailyPositionB) {
      return dailyPositionA - dailyPositionB
    }

    return priorityRank[taskA.priority] - priorityRank[taskB.priority]
  })
}
