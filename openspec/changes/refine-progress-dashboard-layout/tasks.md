## 1. Brand Interaction Checkpoint

- [ ] 1.1 Ask the user one focused question to choose whether the compact Taskmaster mark links to the landing page or remains non-interactive; wait for the answer before editing the shared mark.
- [ ] 1.2 Read the relevant installed Next.js Link and CSS guidance, then recheck the landing mark, workspace navigation, header hierarchy, metric component, and responsive breakpoints.

## 2. Shared Mark And Simplified Header

- [ ] 2.1 Extract the existing inline SVG into one shared `TaskmasterMark` component with caller-controlled sizing and concise ownership comments.
- [ ] 2.2 Update the landing page to use the shared component with its existing size, shadow, position, and decorative behavior unchanged.
- [ ] 2.3 Replace the workspace eyebrow, oversized heading, and PostgreSQL paragraph with exact title `Command Center` and place the compact shared mark at the right according to the interaction answer.
- [ ] 2.4 Preserve the existing back link and Clerk user control in the top navigation without changing authentication or focus behavior.

## 3. Compact Horizontal Metric Ribbon

- [ ] 3.1 Remove active-priority derivation and presentation, the internal Module 14/dashboard heading, UTC header label, and unknown-history footnote without changing trusted metric calculations.
- [ ] 3.2 Convert the progress component into one full-width connected ribbon with four metric cells in one wide row, two intermediate columns, and one narrow column.
- [ ] 3.3 Place the ribbon below the title row and above task controls/cards while preserving live Active, Overdue, Completed this week, and Daily focus updates.
- [ ] 3.4 Keep metric labels, details, icons, heading semantics, and UTC explanatory text readable and accessible at every breakpoint.
- [ ] 3.5 Add concise comments only around shared brand ownership and the responsive one/two/four-column hierarchy.

## 4. Documentation And Verification

- [ ] 4.1 Update README and OpenSpec context to record Module 14.1 layout refinement while keeping Module 15 as next.
- [ ] 4.2 Manually verify landing mark parity, exact workspace title, mark alignment/interaction, preserved navigation/avatar, wide horizontal ribbon, intermediate wrap, narrow stack, and live metric updates one focused question at a time.
- [ ] 4.3 Confirm no Prisma schema, migration, Server Action, ownership rule, Gemini prompt, AI quota, daily-plan persistence, task sorting, or metric definition changed.
- [ ] 4.4 Run formatting, ESLint, TypeScript checking, the Next.js production build, strict OpenSpec validation, and `git diff --check`; resolve any failures.
- [ ] 4.5 Report changed files in recommended reading order, concise per-file explanations, a small header-to-ribbon layout flow, verification results, and reusable visual-hierarchy lessons.
