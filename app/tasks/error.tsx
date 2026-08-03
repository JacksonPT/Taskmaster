"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

type TasksErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function TasksError({ unstable_retry }: TasksErrorProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-app-background px-6 text-app-foreground">
      <section className="w-full max-w-lg rounded-[2rem] border border-app-border bg-app-panel p-8 text-center shadow-2xl shadow-black/30">
        <p className="font-heading text-xs font-semibold tracking-[0.3em] text-brand-soft uppercase">
          Workspace unavailable
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          We could not load your tasks
        </h1>
        <p className="mt-4 leading-7 text-stone-300">
          Your saved data has not been changed. Check your connection and try
          loading the workspace again.
        </p>
        <Button
          type="button"
          className="mt-7 h-11 rounded-full bg-brand-primary px-5 text-stone-950 hover:bg-brand-primary-hover"
          onClick={() => unstable_retry()}
        >
          <RotateCcw />
          Try again
        </Button>
      </section>
    </main>
  )
}
