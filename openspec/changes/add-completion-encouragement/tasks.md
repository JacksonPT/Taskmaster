## 1. Visual And Architecture Checkpoint

- [ ] 1.1 Ask the user one focused question about whether the amber celebration should leave the dashboard faintly visible or become nearly opaque; wait for the answer before editing application files.
- [ ] 1.2 Read the relevant installed Next.js CSS guidance and recheck the task completion handler, returned task shape, global design tokens, and current motion utilities.

## 2. Success-Gated Client Feedback

- [ ] 2.1 Add ephemeral keyed celebration state to `TaskDashboard` without changing persisted task or daily-plan state.
- [ ] 2.2 Start or restart the celebration only after `toggleTaskComplete` successfully returns status Done; preserve normal updates without celebration for reopen and failure paths.
- [ ] 2.3 Render a fixed, pointer-transparent, non-modal overlay with centered exact text `Task Complete!`, polite atomic status semantics, responsive spacing, and no focus movement.
- [ ] 2.4 Add concise comments only around the trusted server-result gate and non-modal accessibility boundary.

## 3. Motion And Accessibility

- [ ] 3.1 Ask the user one focused question to confirm whether reduced-motion users should receive the planned opacity-only visual or an announcement without a full-screen visual; wait for the answer before finalizing CSS.
- [ ] 3.2 Add named global CSS animations for one continuous warm amber pulse and text entrance/fade lasting approximately 1.5 seconds, with no repeated strobing.
- [ ] 3.3 Add a `prefers-reduced-motion: reduce` override that follows the user's answer while preserving automatic cleanup and the accessible status message.
- [ ] 3.4 Verify animation completion removes only the currently mounted celebration so a later successful completion can restart it safely.

## 4. Documentation And Verification

- [ ] 4.1 Update `README.md` and `openspec/config.yaml` to record Module 12, describe deterministic ephemeral encouragement, and identify Module 13 notes/resources as next.
- [ ] 4.2 Manually verify successful completion, reopen, failed mutation behavior where feasible, repeated completion, approximately 1.5-second cleanup, desktop, mobile, keyboard focus, pointer interaction, and reduced motion one focused question at a time.
- [ ] 4.3 Confirm no Prisma schema, migration, Server Action contract, Clerk ownership filter, Gemini prompt, AI quota, task ordering, or persisted plan behavior changed.
- [ ] 4.4 Run Prettier, ESLint, TypeScript checking, the Next.js production build, strict OpenSpec validation, and `git diff --check`; resolve any failures.
- [ ] 4.5 Report changed files in recommended reading order, concise per-file explanations, a small server-success-to-feedback flow, verification results, and reusable animation/accessibility lessons.
