import { ArrowLeft, ListChecks, Timer, Trophy } from "lucide-react"
import Link from "next/link"

import { TaskCard, type Task } from "@/components/tasks/task-card"

const tasks: Task[] = [
  {
    id: 1,
    title: "Set up project README",
    description: "Document the app idea, stack, MVP scope, and build roadmap.",
    priority: "High",
    status: "Done",
    dueDate: "Today",
    aiSuggestion:
      "Keep this short and clear so the project is easy to explain on GitHub and in interviews.",
  },
  {
    id: 2,
    title: "Design the first task dashboard",
    description:
      "Create the layout users will eventually see after logging in.",
    priority: "High",
    status: "In Progress",
    dueDate: "Today",
    aiSuggestion:
      "Start with mock data first. This lets you learn UI structure before adding a database.",
  },
  {
    id: 3,
    title: "Choose database provider",
    description: "Compare Neon and Supabase for hosted PostgreSQL.",
    priority: "Medium",
    status: "Todo",
    dueDate: "This week",
    aiSuggestion:
      "Pick the option with the clearest free tier and easiest connection string setup.",
  },
  {
    id: 4,
    title: "Write auth notes",
    description: "List what should be private once users can log in.",
    priority: "Low",
    status: "Todo",
    dueDate: "Later",
    aiSuggestion:
      "Focus on task ownership first: each user should only see the tasks they created.",
  },
]

export default function TasksPage() {
  // Derived values are calculated from the task list instead of hard-coded.
  const completedCount = tasks.filter((task) => task.status === "Done").length
  const activeCount = tasks.length - completedCount
  const highPriorityCount = tasks.filter(
    (task) => task.priority === "High"
  ).length

  return (
    <main className="min-h-svh bg-[#070b10] bg-[radial-gradient(circle_at_top_left,rgba(251,191,117,0.08),transparent_32%)] px-6 py-8 text-stone-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-amber-100"
        >
          <ArrowLeft className="size-4" />
          Back to landing page
        </Link>

        <section className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-heading text-sm font-semibold tracking-[0.42em] text-amber-50/90 uppercase">
              Temporary task workspace
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl font-light tracking-[0.08em] text-white uppercase sm:text-6xl">
              Your task command center
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-stone-200">
              This mock dashboard shows the shape of the logged-in experience
              before we connect authentication, a database, or real AI calls.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={ListChecks}
              label="Total tasks"
              value={tasks.length}
            />
            <StatCard icon={Timer} label="Active" value={activeCount} />
            <StatCard
              icon={Trophy}
              label="High priority"
              value={highPriorityCount}
            />
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </section>
      </div>
    </main>
  )
}

type StatCardProps = {
  icon: typeof ListChecks
  label: string
  value: number
}

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/15 bg-[#151922] p-5 shadow-lg shadow-black/15">
      <Icon className="size-5 text-amber-200" />
      <p className="mt-4 text-4xl font-bold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-stone-300 uppercase">
        {label}
      </p>
    </div>
  )
}
