import { TaskDashboard } from "@/components/tasks/task-dashboard"
import { getTasks } from "./actions"

// This file creates the /tasks route. The interactive logic lives in TaskDashboard.
// Database-backed pages should render at request time so they show current rows.
export const dynamic = "force-dynamic"

export default async function TasksPage() {
  const tasks = await getTasks()

  return <TaskDashboard initialTasks={tasks} />
}
