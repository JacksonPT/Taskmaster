## Why

Module 14 should turn Taskmaster's persisted task state into useful progress insight rather than leaving users with only total, active, and high-priority counters. A focused dashboard will teach trustworthy metric derivation while helping users see current workload, overdue risk, recent completion, priority balance, and today's focus progress.

## What Changes

- Add a responsive progress dashboard for the authenticated user's already-loaded owned tasks.
- Show active-task count, overdue active-task count, tasks completed in the current Monday-start UTC week, active-task priority distribution, and completed-versus-planned progress for the current UTC daily plan.
- Add an optional `completedAt` timestamp to tasks so weekly completion metrics use the actual trusted status transition rather than mutable `updatedAt` values.
- Set `completedAt` when the server changes a task to Done and clear it when the task is reopened.
- Leave previously completed rows with an unknown `completedAt` uncounted from weekly completion instead of inventing historical completion times.
- Derive metrics deterministically in application code from owned task and daily-plan data; do not call Gemini or consume AI quota.
- Use UTC for overdue, plan-date, and weekly boundaries, with the week beginning Monday at `00:00 UTC`.
- Update documentation and OpenSpec context so Module 14 becomes complete and Module 15 quality hardening becomes next.
- Do not add 30-day charts, event history, streaks, user timezone settings, comparative AI analysis, or decorative metrics without a clear decision use.

## Capabilities

### New Capabilities

- `progress-dashboard`: Covers trusted completion timestamps, exact metric definitions, current-plan progress, deterministic derivation, and responsive dashboard presentation.

### Modified Capabilities

None.

## Impact

- `prisma/schema.prisma` and a migration: add nullable `Task.completedAt` and regenerate Prisma types.
- `app/tasks/actions.ts`: map the timestamp to UI data and update it atomically with complete/reopen transitions.
- `components/tasks/task-card.tsx`: extend the shared UI task shape with completion time.
- `components/tasks/task-dashboard.tsx` and a focused dashboard component: derive live metrics from current client state and present them responsively.
- `README.md` and `openspec/config.yaml`: document Module 14 and identify Module 15 as next.
- No new dependency, route, AI request, quota behavior, ownership rule, or task-event history table.
