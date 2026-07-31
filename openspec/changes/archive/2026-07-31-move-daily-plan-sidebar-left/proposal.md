## Why

Module 11.1 currently places the collapsible daily-plan sidebar on the right side of the wide dashboard. Moving it to the left gives the day's focus plan earlier visual priority and makes it the starting context before users scan task cards.

## What Changes

- Change the saved daily plan from a right-side to a left-side sidebar at the existing wide breakpoint.
- Keep the daily plan before the task-card area in both visual and document order when a plan exists.
- Reverse collapse and expand directional affordances so they match a left-side rail.
- Preserve the expanded and collapsed widths, sticky behavior, narrow-screen stacking, keyboard focus transfer, and accessible toggle state.
- Preserve task sorting, focus badges, persisted Move Up and Move Down actions, completed-task styling, and zero-AI manual reordering.
- Do not change Prisma models, Server Actions, Gemini prompts or quota, Clerk ownership checks, saved plan data, or the no-plan full-width layout.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `daily-plan-sidebar`: Change the wide-screen placement requirement from a right-side sidebar to a left-side sidebar while preserving responsive and interactive behavior.

## Impact

- Primary implementation: `components/tasks/task-dashboard.tsx` dashboard grid, source order, and wide-screen placement classes.
- Supporting presentation: `components/tasks/daily-plan-panel.tsx` directional collapse and expand icons.
- Documentation and tests: sidebar placement descriptions and responsive/accessibility verification.
- No API, database, authentication, ownership, persistence, dependency, or AI behavior changes.
