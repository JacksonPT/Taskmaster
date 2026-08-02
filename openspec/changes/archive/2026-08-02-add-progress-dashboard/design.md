## Context

The authenticated `/tasks` page already loads every owned task and the current daily plan through Server Components, then `TaskDashboard` keeps those records current after Server Actions. Its existing header shows only total, active, and high-priority counts. Those counters do not answer whether work is overdue, whether recent progress is happening, whether active work is balanced, or how much of today's focus plan is complete.

The `Task` model has `createdAt` and mutable `updatedAt`, but no trustworthy completion timestamp. Module 14 needs a nullable `completedAt` set by the existing server-authoritative lifecycle transition before it can report weekly completion honestly. The selected scope is focused productivity metrics, UTC boundaries, and a Monday-start UTC week; historical event charts and user timezones are excluded.

## Goals / Non-Goals

**Goals:**

- Present active, overdue, current-week completion, priority-balance, and current-focus progress metrics.
- Derive every metric from authenticated owned data already loaded by the page.
- Record completion time atomically with the trusted Done transition and clear it on reopen.
- Update metrics immediately after create, edit, delete, complete, reopen, plan generation, and plan reordering where relevant.
- Keep the dashboard readable and useful on desktop and narrow screens.
- Teach precise metric definitions, UTC boundaries, and the difference between current-state and historical analytics.

**Non-Goals:**

- Thirty-day charts, status-event history, streaks, forecasts, comparisons between users, or AI-generated analysis.
- User-local or saved timezone configuration.
- Backfilling historical completion times from `updatedAt`.
- A new dashboard route, analytics API, aggregate database table, chart dependency, or background job.
- Changing Clerk ownership, Gemini prompts, AI quota, daily-plan persistence, or existing task sorting.

## Decisions

### Add nullable `Task.completedAt`

Prisma will add `completedAt DateTime?`. The existing complete/reopen Server Action will set it to the server's current time when moving to Done and set it to `null` when reopening. Status and timestamp will commit in the same Prisma update, so the metric cannot observe a completed task without its new timestamp after the migration.

Existing Done rows remain null because their real completion time is unknown. Using `updatedAt` as a backfill would present edits or unrelated updates as completions and violate the roadmap's trusted-data requirement.

### Keep metric derivation deterministic and local to loaded state

The page already loads all owned tasks and the current plan. A focused progress component can derive metrics from those props on each render, giving immediate updates from `TaskDashboard` state without another database query or Server Action. This matches existing deterministic priority and focus sorting and consumes no Gemini quota.

The alternative is a new server aggregate query. That becomes useful for very large or historical datasets, but it would duplicate current data flow for the present workspace and complicate live client updates.

### Define exact UTC boundaries

- Active tasks have a status other than Done.
- Overdue tasks are active and have a `YYYY-MM-DD` due-date key earlier than the current UTC date key; tasks due today are not overdue.
- Completed this week tasks are currently Done and have `completedAt` from Monday `00:00 UTC` through the current time.
- Priority distribution counts High, Medium, and Low among active tasks only.
- Daily focus progress counts Done tasks among visible items in a plan whose `planDate` equals the current UTC date; an absent or old plan produces an explicit no-current-plan state.

Calendar-week boundaries are easier to explain than a moving 168-hour window and match the user's selection. UTC matches the existing daily-plan quota and avoids adding profile settings.

### Add a focused presentation component

A dedicated `ProgressDashboard` component will receive current tasks, daily plan, and the current UTC date key from `TaskDashboard`. This keeps the already-large dashboard readable while retaining one source of client state. It will use existing Taskmaster panels, typography, icons, CSS grid, and simple proportional bars rather than adding a chart package.

The apply phase will ask one visual placement question before finalizing whether this replaces the current header counters or becomes a distinct overview section.

### Preserve ownership and AI boundaries

No client-selected user ID or new data endpoint is introduced. Metrics operate only on task and plan records that existing authenticated, user-scoped reads already returned. No metric requires model judgment, so Gemini prompts and quota remain untouched.

### Comment metric definitions, not arithmetic syntax

Useful comments should explain UTC week calculation, why null historical timestamps are excluded, and why current-plan progress checks the plan date. Comments that restate filters, counts, or JSX should be avoided.

## Risks / Trade-offs

- [Risk] Existing Done tasks show zero recent completions. -> Explain that only trustworthy post-migration completion timestamps count; never invent history.
- [Risk] UTC week and overdue boundaries differ from a user's local midnight. -> Label the dashboard boundary as UTC and preserve consistency with daily planning.
- [Risk] Metrics drift after UTC midnight in a long-open tab. -> Reuse the dashboard's existing UTC-midnight state update so date-derived metrics rerender.
- [Risk] A completed plan item references a task no longer visible. -> Count only plan items that still resolve to current owned task state.
- [Risk] Additional cards clutter the workspace. -> Replace or consolidate existing counters based on the user's apply-time placement choice and use a responsive hierarchy.
- [Trade-off] Current-state derivation does not preserve repeated completion history. -> Defer event history until a concrete chart or audit requirement exists.

## Migration Plan

1. Add nullable `completedAt` to Prisma and create/apply a versioned migration without historical backfill.
2. Regenerate Prisma Client and map completion timestamps into the shared UI task shape.
3. Update complete/reopen to maintain status and timestamp atomically.
4. Add deterministic metric derivation and responsive presentation after one visual checkpoint.
5. Update roadmap documentation and verify live task/plan updates.
6. Run Prisma validation/generation, formatting, lint, type checking, production build, strict OpenSpec validation, and whitespace checks.

Rollback removes dashboard presentation and timestamp writes. Dropping the nullable database column requires a deliberate reverse migration; no existing application field depends on it before this module.

## Open Questions

- During apply, should the focused dashboard replace the three existing header counters or appear as a separate overview section beneath the header?
