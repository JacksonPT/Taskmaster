## 1. Completion Data Checkpoint

- [x] 1.1 Ask the user one focused question to confirm pre-migration Done tasks with unknown completion time should remain excluded rather than be backfilled from `updatedAt`; wait for the answer before editing Prisma.
- [x] 1.2 Read the relevant installed Next.js data/rendering guidance and recheck Prisma migration conventions, task mapping, complete/reopen flow, daily-plan shape, and UTC helpers.

## 2. Trusted Completion Timestamp

- [x] 2.1 Add nullable `completedAt` to `Task` with a concise comment explaining why it differs from `updatedAt`.
- [x] 2.2 Create and apply a versioned Prisma migration with no historical backfill, then regenerate Prisma Client and validate the schema.
- [x] 2.3 Extend the shared UI `Task` shape and database mapper with a stable ISO completion timestamp or empty value.
- [x] 2.4 Update the existing owned complete/reopen mutation so status and `completedAt` are written atomically, without changing authentication, ownership criteria, or its return contract.
- [x] 2.5 Verify create, edit, delete, AI completion-plan, and daily-plan paths continue carrying the extended task shape correctly.

## 3. Dashboard Placement Checkpoint

- [x] 3.1 Ask the user one focused question to choose whether focused progress replaces the three existing header counters or appears as a separate overview section; wait for the answer before editing dashboard layout.
- [x] 3.2 Recheck current header, task controls, sidebar layout, breakpoint hierarchy, and established panel/card styles against the user's placement answer.

## 4. Deterministic Progress Dashboard

- [x] 4.1 Add a focused `ProgressDashboard` component that accepts current owned tasks, current daily plan, and current UTC date key without introducing a chart dependency or provider request.
- [x] 4.2 Derive active count, overdue active count, Monday-start UTC weekly completions, and High/Medium/Low active-priority counts using the exact specified boundaries.
- [x] 4.3 Derive completed-versus-visible progress only for a plan dated today in UTC, and present a clear no-current-plan state otherwise.
- [x] 4.4 Present scannable summary values, labeled proportional bars, UTC boundary context, and unknown-history-safe copy in the established visual language.
- [x] 4.5 Integrate the component according to the placement answer so metrics update from existing task and plan client state after successful mutations without changing task sorting.
- [x] 4.6 Add concise comments only around UTC week boundaries, unknown completion history, and current-plan date checks.

## 5. Documentation And Verification

- [x] 5.1 Update `README.md` and `openspec/config.yaml` to document Module 14 metrics and identify Module 15 quality hardening as next.
- [x] 5.2 Manually verify zero-data, unknown historical Done, active, overdue, due-today, weekly completion, complete, reopen, priority, no-current-plan, current-plan, desktop, and narrow states one focused question at a time. Zero-data behavior was statically reviewed to avoid deleting the user's tasks.
- [x] 5.3 Confirm the dashboard uses only existing authenticated owned records and changes no Gemini prompt, AI quota, daily-plan persistence, ownership rule, or cross-user behavior.
- [x] 5.4 Run Prisma validation/generation, formatting, ESLint, TypeScript checking, the Next.js production build, strict OpenSpec validation, and `git diff --check`; resolve any failures.
- [x] 5.5 Report changed files in recommended reading order, concise per-file explanations, a small trusted-data-to-metrics flow, verification results, migration behavior, and reusable metric-design lessons.
