import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

// Inline SVG keeps the brand mark crisp without introducing a separate asset.
// Because it is inline, we can style it with CSS variables from globals.css.
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
        <mask id="mark-cutouts">
          <rect width="200" height="200" fill="white" />
          <ellipse cx="100" cy="45" rx="42" ry="43" fill="black" />
          <ellipse cx="62" cy="128" rx="36" ry="47" fill="black" />
          <ellipse cx="138" cy="128" rx="36" ry="47" fill="black" />
        </mask>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="82"
        stroke="url(#mark-gradient)"
        strokeWidth="12"
      />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="url(#mark-gradient)"
        mask="url(#mark-cutouts)"
      />
    </svg>
  )
}

export default function Page() {
  return (
    <main className="min-h-svh overflow-hidden bg-app-background text-app-foreground">
      <section className="relative flex min-h-svh items-center justify-center px-6 py-16 sm:px-8">
        {/* Decorative background layers. They sit behind the content because the content wrapper is relative. */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#403029_0%,transparent_34%),linear-gradient(135deg,rgba(251,191,117,0.16),transparent_28%),linear-gradient(225deg,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-app-background to-transparent" />

        {/* The landing hero uses one column on mobile and two columns on large screens. */}
        <div className="relative grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
            <TaskmasterMark />

            <p className="mt-8 font-heading text-sm font-semibold tracking-[0.48em] text-brand-soft uppercase">
              Task planning for focused people
            </p>

            <h1 className="mt-5 font-heading text-5xl font-light tracking-[0.12em] text-brand-primary uppercase sm:text-6xl lg:text-7xl">
              Task Master:
              <span className="block bg-linear-to-r from-amber-100 via-orange-200 to-stone-400 bg-clip-text text-transparent">
                AI Powered Productivity
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-stone-300 sm:text-lg">
              Prioritize the right task, get a realistic plan, and build
              momentum with AI-guided suggestions that keep your day moving.
            </p>

            {/* Clerk renders different controls based on the current session. */}
            <Show when="signed-out">
              <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row">
                {/* mode="modal" keeps users on the landing page during sign-in. */}
                <SignInButton mode="modal">
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 rounded-full bg-brand-primary px-6 text-sm font-semibold text-stone-950 hover:bg-brand-primary-hover"
                  >
                    Log in to view tasks
                    <ArrowRight />
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-full border-brand-primary/20 bg-white/5 px-6 text-sm text-brand-primary hover:bg-white/10"
                  >
                    Create account
                  </Button>
                </SignUpButton>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="mt-9 flex items-center gap-4">
                <Link
                  href="/tasks"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-primary px-6 text-sm font-semibold text-stone-950 transition hover:bg-brand-primary-hover"
                >
                  Open task workspace
                  <ArrowRight className="size-4" />
                </Link>
                <UserButton />
              </div>
            </Show>

            <p className="mt-4 flex items-center gap-2 text-sm text-stone-400">
              <LockKeyhole className="size-4" />
              Sign in is required before the task workspace can be opened.
            </p>
          </div>

          {/* Static preview card: it communicates the future product before real task data exists. */}
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-black/30 backdrop-blur">
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
                {/* Mapping over temporary preview rows keeps repeated card markup in one place. */}
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
                    className="rounded-2xl border border-white/10 bg-white/4 p-4"
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
