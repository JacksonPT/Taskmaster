import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"

function TaskmasterMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-28 drop-shadow-[0_0_36px_rgba(251,191,117,0.24)] sm:size-36"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mark-gradient" x1="36" y1="30" x2="164" y2="174">
          <stop stopColor="#fff1c2" />
          <stop offset="0.42" stopColor="#f4b38e" />
          <stop offset="1" stopColor="#8f5d4b" />
        </linearGradient>
      </defs>

      {/* Temporary inline mark: this gives us a branded logo spot before adding a final asset. */}
      <circle
        cx="100"
        cy="100"
        r="82"
        stroke="url(#mark-gradient)"
        strokeWidth="12"
      />
      <path
        d="M100 35C116 62 132 77 164 81C146 104 134 123 136 158C108 145 91 145 64 158C66 123 54 104 36 81C68 77 84 62 100 35Z"
        fill="url(#mark-gradient)"
      />
      <circle cx="100" cy="66" r="33" fill="var(--app-background)" />
      <circle cx="65" cy="124" r="34" fill="var(--app-background)" />
      <circle cx="135" cy="124" r="34" fill="var(--app-background)" />
    </svg>
  )
}

export default function Page() {
  return (
    <main className="min-h-svh overflow-hidden bg-app-background text-app-foreground">
      <section className="relative flex min-h-svh items-center justify-center px-6 py-16 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#403029_0%,transparent_34%),linear-gradient(135deg,rgba(251,191,117,0.16),transparent_28%),linear-gradient(225deg,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-app-background to-transparent" />

        <div className="relative grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
            <TaskmasterMark />

            <p className="mt-8 font-heading text-sm font-semibold tracking-[0.48em] text-brand-soft uppercase">
              Task planning for focused people
            </p>

            <h1 className="mt-5 font-heading text-5xl font-light tracking-[0.12em] text-brand-primary uppercase sm:text-6xl lg:text-7xl">
              Task Master:
              <span className="block bg-gradient-to-r from-amber-100 via-orange-200 to-stone-400 bg-clip-text text-transparent">
                AI Powered Productivity
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-stone-300 sm:text-lg">
              Prioritize the right task, get a realistic plan, and build
              momentum with AI-guided suggestions that keep your day moving.
            </p>

            <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-full bg-brand-primary px-6 text-sm font-semibold text-stone-950 hover:bg-brand-primary-hover"
              >
                Log in to view tasks
                <ArrowRight />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-brand-primary/20 bg-white/5 px-6 text-sm text-brand-primary hover:bg-white/10"
              >
                See how it works
              </Button>
            </div>

            <p className="mt-4 flex items-center gap-2 text-sm text-stone-400">
              <LockKeyhole className="size-4" />
              Tasks stay private behind your account once authentication is
              added.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-app-surface/90 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-heading text-xs font-semibold tracking-[0.32em] text-brand-primary/60 uppercase">
                    Today&apos;s focus
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-brand-primary">
                    Suggested order
                  </h2>
                </div>
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs text-brand-primary">
                  AI draft
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  [
                    "High",
                    "Finish project proposal",
                    "Deadline and effort make this the best first win.",
                  ],
                  [
                    "Medium",
                    "Review task notes",
                    "Gather context before starting deeper work.",
                  ],
                  [
                    "Low",
                    "Clean up inbox",
                    "Useful, but not urgent enough to lead the day.",
                  ],
                ].map(([priority, title, reason]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 text-amber-200" />
                      <div>
                        <p className="text-sm font-medium text-stone-100">
                          {title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-stone-400">
                          {reason}
                        </p>
                      </div>
                      <span className="ml-auto rounded-full border border-brand-primary/20 px-2 py-1 text-[0.65rem] tracking-[0.18em] text-brand-primary/80 uppercase">
                        {priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
