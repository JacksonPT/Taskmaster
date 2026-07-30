## 1. Canonical Project Specification Baseline

- [x] 1.1 Ask the user one focused question about how much baseline-spec walkthrough they want before any application code changes; wait for the answer.
- [x] 1.2 Audit each completed capability spec against the current README, Git module history, routes, Server Actions, AI services, Prisma schema, and representative UI files; correct any requirement that does not describe current behavior.
- [x] 1.3 Verify `openspec/config.yaml` captures Taskmaster's stack, Modules 1-16, one-question-at-a-time workflow, top-down comment standard, security constraints, and required checks.
- [x] 1.4 Strictly validate the project-local change and confirm `openspec context` resolves `/Taskmaster` with artifacts under `Taskmaster/openspec/`.
- [x] 1.5 Remove the superseded ignored `Taskmaster/specs/` tree and its `/specs` ignore rule only after the canonical artifacts are verified to contain the replacement sidebar decisions.
- [x] 1.6 Report the baseline files in reading order, explain the capability boundaries simply, and pause for the user's explicit approval before beginning Module 11.1 code.

## 2. Module 11.1 Collapse State and Panel Contract

- [ ] 2.1 After the user resumes, ask one focused sidebar interaction question and wait for the answer before editing components.
- [ ] 2.2 Add expanded-by-default collapse state to `TaskDashboard`, pass explicit state and toggle props to `DailyPlanPanel`, and comment why the parent owns state that changes the grid column width.
- [ ] 2.3 Add an accessible collapse/expand control with `aria-expanded`, `aria-controls`, explicit action labels, and a visible reopen control in the narrow rail.

## 3. Module 11.1 Compact Sidebar Presentation

- [ ] 3.1 Ask one focused compact-row visual question and wait for the answer before changing plan content.
- [ ] 3.2 Keep the plan date, visible task count, and main Gemini summary in the expanded header while removing item-level reason text from rendered rows without changing persisted plan data.
- [ ] 3.3 Convert plan items into compact rows that retain focus number, live completion status, task title, and boundary-disabled Move Up/Move Down controls.
- [ ] 3.4 Add concise comments only around non-obvious accessibility, live task lookup, and collapse behavior so the component remains readable top-down.

## 4. Module 11.1 Responsive Dashboard Layout

- [ ] 4.1 Ask one focused responsive-layout question and wait for the answer before selecting the final breakpoint or sticky behavior.
- [ ] 4.2 Replace the separate full-width plan and task sections with a responsive task-area grid that reserves no sidebar column when no plan exists.
- [ ] 4.3 Place the expanded plan in an approximately 22rem right sidebar and the collapsed plan in an approximately 5rem rail at the chosen wide breakpoint; stack the panel before cards on narrower screens.
- [ ] 4.4 Preserve task-card focus badges, daily-position sorting, completed-task ordering, generation controls, quota display, and persisted manual reorder callbacks without adding Gemini calls.

## 5. Documentation and Module Verification

- [ ] 5.1 Update `README.md` so the roadmap includes Module 11.1 and the expanded Modules 12-16, and describe the collapsible sidebar without changing existing AI or quota architecture documentation.
- [ ] 5.2 Manually verify no-plan, expanded, collapsed, wide, narrow, completed-task, Move Up, Move Down, generation, and regeneration states.
- [ ] 5.3 Confirm the implementation changes no Prisma schema, migration, Gemini prompt, Server Action contract, Clerk ownership rule, or AI quota behavior.
- [ ] 5.4 Run Prettier, ESLint, TypeScript checking, the Next.js production build, strict OpenSpec validation, and `git diff --check`; resolve any failures.
- [ ] 5.5 Provide changed files in recommended reading order, simple per-file explanations, a small data/UI flow, verification results, and reusable frontend and OpenSpec lessons.

## 6. Future Module Handoff

- [ ] 6.1 Confirm Module 12 completion encouragement is the next proposal target after Module 11.1 is completed and archived.
- [ ] 6.2 Do not implement Modules 12-16 in this change; preserve their order and require a separate proposal, one-question checkpoints, apply, verification, and archive cycle for each module.
