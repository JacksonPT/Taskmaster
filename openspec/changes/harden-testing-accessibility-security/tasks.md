## 1. Test Foundation

- [ ] 1.1 Ask the user one focused question to confirm the proposed Vitest, Testing Library, Playwright, and axe stack; wait for the answer before installing dependencies.
- [ ] 1.2 Re-read the installed Next.js 16 testing, error-handling, and data-security guidance, then map each planned test to the narrowest trustworthy unit, component, integration, or browser layer.
- [ ] 1.3 Install the agreed development dependencies and add focused `test`, unit/component, integration, browser, accessibility, and aggregate verification scripts without adding CI configuration.
- [ ] 1.4 Add Vitest Node/jsdom setup, Testing Library matchers and cleanup, Playwright configuration, generated-artifact ignores, and one passing smoke test per configured runner.
- [ ] 1.5 Document why external-service tests require explicit isolated configuration and add concise comments only around environment safety and runner boundaries.

## 2. Deterministic Domain Seams

- [ ] 2.1 Ask the user one focused question to confirm small behavior-preserving extractions instead of testing private component/action internals; wait for the answer before refactoring.
- [ ] 2.2 Extract time-parameterized UTC date/week, overdue, completion, and daily-focus calculations and add boundary tests for midnight, Monday week start, unknown completion timestamps, stale plans, and live status changes.
- [ ] 2.3 Extract deterministic task ordering and add tests for focus position, priority fallback, completed-last behavior, ties, and newly created unplanned tasks.
- [ ] 2.4 Add one server-used Zod contract for bounded task content, known priority, optional ISO date key, and bounded identifiers while preserving existing normalization behavior.
- [ ] 2.5 Add table-driven tests for valid and invalid task inputs, date parsing, whitespace normalization, empty optional fields, unknown priorities, malformed dates, and direct invalid identifiers.
- [ ] 2.6 Export the minimum semantic daily-plan validator seam and test omitted, duplicate, altered, invented, reordered, underfilled, overfilled, and oversized structured AI output without calling Gemini.

## 3. Task Actions And Ownership Security

- [ ] 3.1 Ask the user one focused question to confirm inline recoverable errors plus a `/tasks` route error boundary as the failure UX; wait for the answer before changing action contracts.
- [ ] 3.2 Introduce bounded discriminated results for expected task validation, authorization, network, and database failures while leaving unexpected defects available to framework error handling.
- [ ] 3.3 Keep Clerk authentication at every exported task action boundary and add tests proving signed-out calls stop before Prisma access.
- [ ] 3.4 Add ownership regression tests proving one user cannot read, update, delete, complete, reopen, or generate from another user's task and null-owned rows remain invisible.
- [ ] 3.5 Add request-specific pending and accessible error state for create, edit, delete, complete, and reopen so failures preserve committed client state, re-enable controls, and never trigger false completion feedback.
- [ ] 3.6 Add `app/tasks/error.tsx` with a safe retry path for unexpected initial workspace failures and test that it exposes no query, stack, credential, or private record detail.

## 4. AI Failure Boundaries

- [ ] 4.1 Ask the user one focused question to confirm controlled provider doubles with no live Gemini test requests; wait for the answer before introducing provider seams.
- [ ] 4.2 Make the priority and completion generation boundaries controllable in tests while preserving `server-only` ownership, production prompts, Zod parsing, and one-request behavior.
- [ ] 4.3 Test priority success, missing server configuration, provider rejection, timeout, rate limit, malformed enum, empty normalized explanation, and oversized output with no persistence or provider-detail leakage.
- [ ] 4.4 Test completion-plan success, invalid summary/step counts, provider failures, stale task edits/status, foreign IDs, task deletion, and persistence failure while preserving existing guidance unless a trusted replacement commits.
- [ ] 4.5 Add component/action tests proving AI controls prevent duplicate requests, announce safe retry guidance, restore availability, and never render or persist rejected output.

## 5. PostgreSQL Integration And Quota Resilience

- [ ] 5.1 Ask the user one focused question to choose a disposable local database, isolated local schema, or dedicated Neon test branch; wait for the answer before creating integration infrastructure.
- [ ] 5.2 Add `TEST_DATABASE_URL` documentation, validation, a test-only Prisma factory with no `DATABASE_URL` fallback, migration/setup support, unique test ownership keys, and dependency-ordered cleanup.
- [ ] 5.3 Add real PostgreSQL tests for ownership isolation, null-owned rows, unique constraints, cascades, completion timestamp transitions, and transaction rollback.
- [ ] 5.4 Add concurrency tests proving two requests cannot claim one final quota slot, successful use increments only on commit, and provider/validation/persistence failures release only their request reservation.
- [ ] 5.5 Test stale lease expiry, cleanup failure bounded by TTL, and protection against deleting a newer reservation.
- [ ] 5.6 Test manual reorder ownership, exact ID-set validation, no Gemini/quota side effects, transaction rollback, and regeneration/reorder version races.
- [ ] 5.7 Harden initial planning lookups and client reorder/generation failures to return safe retryable outcomes while retaining the last committed plan, usage, and visible order.

## 6. Accessibility Hardening

- [ ] 6.1 Ask the user one focused question to remove the global unmodified `d` theme shortcut or replace it with a modifier-based alternative; wait for the answer before editing theme behavior.
- [ ] 6.2 Apply the selected shortcut behavior and verify visible controls remain keyboard and pointer operable without interfering with typing.
- [ ] 6.3 Associate task fields with required, invalid, description, and error semantics and make all important form and mutation failures available through appropriate alert or status regions.
- [ ] 6.4 Move focus into newly opened add/edit content, restore it to an appropriate initiating control after cancel/save, and retain the existing daily-plan collapse focus behavior.
- [ ] 6.5 Add component tests for accessible names, field/error relationships, pending controls, live feedback, completion celebration gating, sidebar state, reorder boundaries, and focus movement/restoration.
- [ ] 6.6 Manually audit keyboard order, visible focus, 200% and 400% zoom/reflow, narrow-screen overflow, contrast, reduced motion, and announcement usefulness one focused verification question at a time; resolve failures.

## 7. Browser And Accessibility Regression Suite

- [ ] 7.1 Ask the user one focused question to choose dedicated Clerk test credentials or a credential-free signed-out browser baseline backed by action/service ownership tests; wait for the answer before authenticated browser setup.
- [ ] 7.2 Configure Playwright against a production-like local server and add public landing plus signed-out `/tasks` protection coverage without committing authentication state, traces with secrets, or credentials.
- [ ] 7.3 Add only the authenticated CRUD, completion, sidebar, and responsive workspace flows supported by the selected Clerk strategy, using isolated test users and data.
- [ ] 7.4 Add axe checks and browser assertions for keyboard access, reduced motion, wide/intermediate/narrow reflow, and absence of horizontal page overflow.
- [ ] 7.5 Verify browser tests never call live Gemini and document which security, transaction, contrast, and announcement guarantees remain covered below E2E or by manual review.

## 8. Documentation And Final Verification

- [ ] 8.1 Ask the user one focused question to confirm the documented local quality workflow and manual checklist are practical; wait for the answer before finalizing Module 15 documentation.
- [ ] 8.2 Update README, `.env.example`, and OpenSpec context with test commands, resource isolation, no-live-AI policy, manual accessibility checks, Module 15 completion, and Module 16 as next.
- [ ] 8.3 Confirm production Prisma schema, migrations, AI prompts, quota limits, ownership rules, metrics, sorting, and persisted-data semantics changed only where explicitly required by these artifacts; update artifacts before any unplanned behavior or schema change.
- [ ] 8.4 Run formatting, fast tests, integration tests, browser/accessibility tests, aggregate verification, ESLint, TypeScript checking, Prisma validation/generation, the Next.js production build, strict OpenSpec validation, and `git diff --check`; resolve every failure.
- [ ] 8.5 Report changed files in recommended reading order, concise per-file explanations, a small request-to-test-layer flow, security/accessibility/failure verification results, unresolved environment-dependent coverage, and reusable quality-engineering lessons.
