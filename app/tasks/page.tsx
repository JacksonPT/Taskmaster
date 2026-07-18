import { auth } from "@clerk/nextjs/server"

import { TaskDashboard } from "@/components/tasks/task-dashboard"
import { getTasks } from "./actions"

// This file creates the /tasks route. The interactive logic lives in TaskDashboard.
// Database-backed pages should render at request time so they show current rows.
export const dynamic = "force-dynamic"

export default async function TasksPage() {
  // Protect the resource where it is read. Signed-out visitors are redirected
  // to Clerk sign-in before the database query or dashboard render can happen.
  const { isAuthenticated, redirectToSignIn } = await auth()

  if (!isAuthenticated) {
    return redirectToSignIn({ returnBackUrl: "/tasks" })
  }

  const tasks = await getTasks()

  return <TaskDashboard initialTasks={tasks} />
}
