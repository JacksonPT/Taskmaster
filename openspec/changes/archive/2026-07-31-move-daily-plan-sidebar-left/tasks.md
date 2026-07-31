## 1. Placement Checkpoint

- [x] 1.1 Ask the user one focused question to confirm that narrow screens should continue stacking the daily plan before task cards; wait for the answer before editing components.
- [x] 1.2 Recheck the current dashboard grid, sidebar controls, canonical requirement, and README placement language so implementation remains limited to the agreed presentation change.

## 2. Left-Side Sidebar Implementation

- [x] 2.1 Render the conditional daily-plan aside before the task-card section so document, keyboard, narrow-screen, and wide-screen order all place the plan first.
- [x] 2.2 Change the expanded and collapsed `xl` grid tracks to reserve the 22rem or 5rem first column for the sidebar and keep task cards in the flexible right column without changing the no-plan layout.
- [x] 2.3 Reverse the collapse and expand chevrons for a left-side rail while preserving explicit accessible labels, `aria-expanded`, `aria-controls`, and replacement-control focus transfer.
- [x] 2.4 Update only the non-obvious layout ownership/source-order comment; avoid comments that merely narrate Tailwind classes or icon swaps.

## 3. Documentation And Verification

- [x] 3.1 Update README placement language from a right-side sidebar to a left-side sidebar without changing the Module 12-16 roadmap or backend architecture documentation.
- [x] 3.2 Manually verify no-plan, expanded, collapsed, wide, and narrow layouts; confirm the plan remains before cards, no horizontal overflow appears, and sticky behavior remains usable.
- [x] 3.3 Keyboard-check both collapse controls and manually exercise Move Up and Move Down to confirm focus transfer, disabled boundaries, persisted order, task-card focus positions, and zero Gemini calls.
- [x] 3.4 Confirm no Prisma schema, migration, Server Action, Gemini prompt, quota, Clerk ownership, or persisted plan-data behavior changed.
- [x] 3.5 Run Prettier, ESLint, TypeScript checking, the Next.js production build, strict OpenSpec validation, and `git diff --check`; resolve any failures.
- [x] 3.6 Report changed files in recommended reading order, concise per-file explanations, a small responsive layout flow, verification results, and reusable CSS Grid/accessibility lessons.
