## Context

The current Module 11.1 dashboard renders task cards before the daily-plan component in the DOM, then uses responsive grid ordering to place the plan before cards on narrow screens and on the right on wide screens. The parent dashboard also owns collapse state because that state changes the grid's second-column width. This change moves the existing sidebar to the left without changing its data, state ownership, interactions, breakpoint, or visual dimensions.

## Goals / Non-Goals

**Goals:**

- Render the expanded 22rem sidebar and collapsed 5rem rail as the first wide-screen grid column.
- Put the daily plan before task cards in document order so keyboard and reading order match its visual priority.
- Make collapse and expand icons point toward the appropriate state for a left-side sidebar.
- Preserve the existing stacked narrow layout, sticky wide layout, focus transfer, plan controls, and responsive readability.
- Teach how DOM order, CSS Grid columns, responsive order, and directional affordances work together.

**Non-Goals:**

- Redesigning the daily-plan panel, task cards, header, summary, or reorder controls.
- Persisting collapse state between visits.
- Changing plan generation, quota, manual ordering, task sorting, Prisma models, Clerk ownership, or Gemini behavior.
- Starting Module 12 or changing the remaining module roadmap.

## Decisions

### Make the sidebar the first grid child and first grid track

`TaskDashboard` will render the conditional `<aside>` before the task-card `<section>`. At `xl`, the grid template will use `22rem minmax(0,1fr)` when expanded and `5rem minmax(0,1fr)` when collapsed. This keeps document, keyboard, mobile, and desktop order aligned and removes the need to visually move later DOM content ahead of earlier content.

The alternative is to leave the DOM unchanged and use responsive `order` classes. That is a smaller textual diff, but it preserves a mismatch between source order and the newly intended visual hierarchy.

### Preserve dashboard-owned collapse state

Collapse state remains in `TaskDashboard` because the parent chooses both grid tracks. `DailyPlanPanel` continues to receive explicit state and callbacks. Moving that state into the panel would force indirect layout communication and add complexity unrelated to placement.

### Reverse only directional affordances

The expanded control will indicate collapsing toward the left rail, and the collapsed rail will indicate expanding toward the task area on its right. Existing labels, `aria-expanded`, `aria-controls`, replacement-control focus transfer, and mobile presentation remain intact. The icons reinforce direction but do not replace accessible names.

### Keep the change presentation-only

No Server Action, persisted record, quota lease, ownership filter, or AI request changes. This isolates risk to responsive layout and ensures manual reordering remains deterministic and quota-free.

### Keep comments focused on layout ownership

The existing parent-grid comment should be updated to explain why the plan comes first in source and grid order. Additional comments around individual Tailwind classes or icon swaps would repeat the code and add noise.

## Risks / Trade-offs

- [Risk] Task-card width or wrapping could regress when the fixed track moves first. -> Keep `minmax(0,1fr)` and `min-w-0`, then verify expanded and collapsed states at and around `xl`.
- [Risk] Visual order could diverge from keyboard or screen-reader order. -> Render the plan first in the DOM rather than relying only on CSS `order`.
- [Risk] Reversed icons could communicate the wrong direction on narrow screens. -> Verify both controls at mobile and wide widths while retaining explicit accessible labels as the authoritative action description.
- [Trade-off] The daily plan becomes the first focusable dashboard region when present. -> This is intentional because the change gives the focus plan priority before task execution cards.

## Migration Plan

1. Update the responsive grid tracks and child source order.
2. Reverse the left-sidebar collapse and expand indicators.
3. Update placement documentation and verify no backend files or contracts changed.
4. Run formatting, lint, type checking, production build, strict OpenSpec validation, and whitespace checks.

Rollback is a presentation-only revert of the grid/source order and directional icons; no data migration or compatibility path is required.

## Open Questions

None. The requested left placement and all preserved behaviors are sufficiently defined for implementation.
