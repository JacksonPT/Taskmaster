## Why

Module 14.1 should correct the progress dashboard's oversized two-column composition, which competes with the workspace title and pushes task controls down the page. A simplified header and compact horizontal metric ribbon will make the command center feel intentional, scannable, and task-focused.

## What Changes

- Replace the current eyebrow, oversized `Your task command center` heading, and PostgreSQL description with one concise `Command Center` title.
- Reuse the existing Taskmaster landing-page brand mark at the upper right of the same title row.
- Extract the inline brand mark into a shared component so landing and task routes use one SVG implementation.
- Move progress below the title as a full-width horizontal ribbon and above task controls/cards.
- Keep only the four selected headline metrics: Active, Overdue, Completed this week, and Daily focus.
- Remove the active-priority distribution panel, `Module 14` label, `Progress dashboard` title, UTC header label, and unknown-history footnote from the visible dashboard.
- Preserve every metric's existing deterministic calculation, UTC boundary, trusted `completedAt` behavior, live update, accessibility, and no-AI data flow.
- Keep the existing back navigation and Clerk user control in the top navigation row.
- Wrap the four-cell ribbon responsively on narrow screens without horizontal overflow.
- Do not change Prisma, migrations, Server Actions, ownership rules, Gemini, quotas, daily-plan persistence, metric definitions, or task sorting.

## Capabilities

### New Capabilities

- `workspace-header`: Covers the simplified `Command Center` title row, shared Taskmaster brand mark, and preserved navigation/session controls.

### Modified Capabilities

- `progress-dashboard`: Replace the large dashboard panel and active-priority distribution with a compact horizontal four-metric ribbon while preserving trusted metric behavior.

## Impact

- `app/page.tsx` and a shared brand-mark component: move the existing inline SVG into reusable presentation code.
- `components/tasks/task-dashboard.tsx`: simplify header content and place the metric ribbon below it.
- `components/tasks/progress-dashboard.tsx`: remove priority derivation/presentation and redesign the four metrics as a horizontal responsive bar.
- Documentation and OpenSpec requirements: record the Module 14.1 layout refinement.
- No database, migration, API, dependency, security, AI, quota, or persisted-data changes.
