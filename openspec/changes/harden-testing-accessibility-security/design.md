## Context

Taskmaster has completed its product feature modules through the Module 14.1 dashboard refinement. TypeScript, ESLint, Prettier, Prisma tooling, production builds, strict OpenSpec validation, and manual review are established, but the repository has no automated test runner or test files. The highest-risk behavior spans Clerk authentication, user-scoped Prisma access, structured Gemini output, daily-plan quota leases and transactions, UTC-derived metrics, client state transitions, and accessible asynchronous feedback.

Installed Next.js 16 guidance recommends Vitest with React Testing Library for pure logic and synchronous components, and browser end-to-end coverage for async Server Components. Next.js data-security guidance also treats every Server Action as an independent public boundary that must validate input, authenticate, authorize, and limit returned data. Module 15 must add confidence without using production data, real personal credentials, or live Gemini quota, and without absorbing Module 16 CI, deployment, observability, or portfolio work.

## Goals / Non-Goals

**Goals:**

- Establish fast unit/component, isolated PostgreSQL integration, and Playwright browser/accessibility test layers with explicit pnpm commands.
- Prioritize authentication-before-I/O, cross-user isolation, AI validation, quota concurrency, rollback, stale-response protection, and user-visible failure recovery.
- Extract small deterministic or dependency-injected seams where framework-bound code currently prevents precise testing.
- Add runtime validation to browser-controlled task input and identifiers.
- Standardize expected action failures so the client can preserve committed state, prevent duplicate actions, and announce retryable errors.
- Add a route-level recovery boundary for unexpected initial workspace failures.
- Resolve accessibility risks around the global character shortcut, form errors, focus movement/restoration, pending controls, live feedback, responsive reflow, and reduced motion.
- Keep test setup understandable as a learning artifact and document where each test layer adds confidence.

**Non-Goals:**

- GitHub Actions, deployment gates, production monitoring, alerting, logging infrastructure, and portfolio presentation.
- Production or personal Clerk credentials, production PostgreSQL, or live Gemini requests in ordinary tests.
- Broad visual redesign, changed AI prompts, changed quota limits, new product metrics, or weaker ownership rules.
- A mandatory repository-wide coverage percentage, large snapshots, or tests coupled to Tailwind class strings.
- Replacing Prisma, Clerk, Gemini, Zod, or Server Actions with a new architecture.

## Decisions

### Use three complementary test layers

Vitest will run Node-based unit/service tests and jsdom React Testing Library component tests. Playwright will cover browser routing, keyboard behavior, responsive reflow, reduced motion, and axe checks. A dedicated integration command will run Vitest tests against PostgreSQL for invariants that mocks cannot prove.

One runner for all behavior was rejected. Playwright is too slow and indirect for schema and quota edge cases, while jsdom cannot prove async route behavior, real browser focus, layout overflow, or PostgreSQL locking and rollback.

The default fast command will not require external services. Integration and authenticated browser commands will validate their required environment explicitly. An aggregate command will compose the documented Module 15 checks locally; CI orchestration remains Module 16.

### Test behavior at the narrowest trustworthy boundary

Deterministic calculations will move into small pure modules with explicit inputs, especially current time. Candidates include Monday UTC boundaries and progress metrics, focus/priority sorting, task normalization and date parsing, and semantic daily-plan ID validation. Zod schemas will remain the runtime source of truth and receive table-driven boundary tests.

Framework adapters will stay thin. Server Actions must still call Clerk authentication independently, but business operations can accept a trusted `userId` and explicit dependencies so tests can control Prisma/provider outcomes without mocking every Next.js internal. Authentication-order tests will exercise the exported action boundary to prove private dependencies are untouched when no user exists.

Duplicating production logic inside tests was rejected because matching tests could pass while the application regresses. Large-scale service extraction was also rejected; only seams required for deterministic tests or stable failure contracts should move.

### Use discriminated expected-failure results and a route error boundary

Expected validation, provider, stale-state, network, and anticipated persistence failures will return bounded discriminated results such as success data or a safe message with optional field errors. The browser will update local state only from successful server results. Delete, complete, reopen, AI, and planning controls will own request-specific pending/error state, prevent duplicate activation, and announce failures. A failed completion cannot trigger celebration because celebration remains keyed to a successful trusted Done result.

Unexpected render or initial data-load failures will flow to `app/tasks/error.tsx`, which offers retry without exposing stack traces, query details, secrets, or private data. Converting every thrown programmer defect into a friendly result was rejected because it would hide faults from the framework error boundary.

### Enforce one runtime task-input contract

A server-used Zod schema will validate bounded title, description, known priority, optional ISO date key, and bounded identifiers before Prisma or Gemini work. Client checks can improve immediacy but are not security controls. Existing normalization behavior remains, and tests will lock its whitespace and optional-field semantics.

TypeScript-only action input was rejected because direct action callers can bypass browser types. Ad hoc conditionals were rejected because they drift from AI schemas and produce incomplete field errors.

### Keep provider tests controlled and quota-free

Gemini-facing modules will expose injectable or mockable generation boundaries while retaining `server-only` ownership and Zod parsing in production. Tests will supply valid, malformed, rejected, timeout, and rate-limit outcomes and verify that invalid output never reaches persistence. No ordinary test reads `GOOGLE_GENERATIVE_AI_API_KEY` or contacts the provider.

Tests that call live Gemini were rejected because they are nondeterministic, spend quota, require secrets, and cannot reliably reproduce malformed output.

### Prove transactional invariants with an explicit test database

PostgreSQL integration tests will require `TEST_DATABASE_URL` and must never fall back to `DATABASE_URL`. A test-only Prisma factory will use the explicit URL. The selected disposable local database, isolated schema, or dedicated Neon branch will receive the current migrations before integration tests. Tests will generate unique Clerk-like user IDs and clean records in dependency order.

Real database cases will cover two requests competing for one quota slot, stale versus current leases, transaction rollback, completion timestamp transitions, uniqueness/cascade behavior, user isolation, and reorder/regeneration version races. Provider and Clerk behavior remain controlled at their boundaries during these tests.

Mock-only quota tests were rejected because they cannot prove row locks, unique constraints, atomic commits, lease cleanup, or concurrent transaction behavior. Production database reuse was rejected as unsafe.

### Separate default and credentialed browser coverage

The baseline Playwright suite will cover the public route, signed-out `/tasks` protection, and any browser behavior that needs no private credentials. Authenticated workspace flows will use Clerk's supported test strategy only with dedicated test credentials and isolated test users. The apply workflow will ask the user to choose a dedicated Clerk test setup or an initially narrower browser suite backed by comprehensive action/service authorization tests.

Personal session storage and hard-coded credentials were rejected. Tests must not commit authentication state, traces containing secrets, or test passwords.

### Treat automated accessibility checks as necessary but incomplete

React Testing Library will assert roles, names, field/error relationships, live regions, disabled states, and focus intent. Playwright plus axe will catch serious browser-level violations and exercise keyboard and responsive paths. A documented manual checklist will cover contrast, 200% and 400% zoom/reflow, reduced motion, visible focus, announcement usefulness, and interaction order.

The unmodified global `d` theme shortcut will be removed or changed to require a modifier and a documented user-controlled mechanism. Dynamic add/edit panels will move focus to useful content and restore it on close. Automated axe-only acceptance was rejected because it cannot establish sensible focus order, announcement timing, motion quality, or all contrast states.

### Keep educational comments at trust and lifecycle boundaries

Comments are useful where a test database is deliberately prevented from falling back to production, where authentication must precede dependency access, where request-specific leases avoid cross-request cleanup, where time is injected for UTC determinism, and where focus is restored across conditional UI. Comments on ordinary test arrangement, render calls, selectors, or obvious assertions would add noise and should be omitted.

## Risks / Trade-offs

- [Risk] Module 15 becomes too broad because it touches most critical features. -> Sequence work by risk, keep each test at the narrowest useful layer, and avoid unrelated refactors or cosmetic redesign.
- [Risk] Refactoring for test seams changes trusted behavior. -> Add characterization tests around pure behavior first, preserve existing contracts unless a delta spec explicitly changes failure handling, and review production diffs separately from tests.
- [Risk] PostgreSQL integration tests are slow or environment-dependent. -> Keep them in a separate command, use explicit setup/cleanup, pin deterministic time/data, and reserve them for constraints and concurrency that mocks cannot prove.
- [Risk] A misconfigured test connects to production data. -> Require `TEST_DATABASE_URL`, reject absent or unsafe configuration before client creation, never fall back to `DATABASE_URL`, and document a disposable resource policy.
- [Risk] Authenticated browser tests are blocked by Clerk setup. -> Keep credential-free route protection in the baseline and ask one apply-time question before the browser group to choose a dedicated Clerk test instance or narrower authenticated scope.
- [Risk] Mocked action tests assert implementation details. -> Assert authentication order, dependency calls, returned contracts, and persisted effects rather than module internals or exact query-object formatting where ownership can be proven behaviorally.
- [Risk] Expected failure results hide unexpected defects. -> Handle only defined validation/provider/stale-state/anticipated persistence failures and preserve thrown errors for route boundaries and developer diagnostics.
- [Risk] Accessibility fixes alter familiar interactions. -> Prefer standards-based focus and shortcut behavior, verify keyboard and pointer use, and preserve established visual language.
- [Trade-off] The aggregate local workflow will take longer than current checks. -> Keep a fast default suite for iteration and run database/browser layers at meaningful checkpoints; CI parallelization belongs to Module 16.

## Migration Plan

1. Ask one focused question to choose the isolated PostgreSQL test resource, then document `TEST_DATABASE_URL` safety and cleanup before adding integration code.
2. Install and configure Vitest, Testing Library, Playwright, and axe; add generated test artifacts to ignores and expose focused pnpm scripts.
3. Extract deterministic UTC, metric, sorting, task-schema, and semantic AI validation seams; add characterization and boundary tests before changing failure contracts.
4. Introduce authenticated service boundaries and discriminated action results in small slices, beginning with task lifecycle and ownership regression tests.
5. Add controlled AI failure tests and PostgreSQL quota/transaction integration tests without live provider calls.
6. Ask one focused question about Clerk browser-test setup, then add the agreed signed-out and authenticated Playwright coverage.
7. Harden focus, form semantics, announcements, pending controls, route recovery, shortcut behavior, and responsive/reduced-motion accessibility; verify with component, browser, axe, and manual checks.
8. Update README and OpenSpec context, run every documented Module 15 check, and record Module 16 as next.

Rollback can remove the new test dependencies/configuration and revert each small production hardening slice independently. No intentional schema migration is planned. Any unexpected need for persisted schema changes requires updating the change artifacts before implementation.

## Open Questions

- Which disposable PostgreSQL resource should back integration tests: a local database, an isolated local schema, or a dedicated Neon test branch? Resolve with one question before the integration group.
- Will dedicated Clerk test credentials be available for authenticated Playwright flows, or should the first browser suite limit authentication to signed-out routing while action/service tests provide the full ownership matrix? Resolve with one question before the browser group.
- Should the global theme shortcut be removed entirely or changed to a modifier-based shortcut alongside a visible control? Default to removal unless the user prefers a discoverable alternative during accessibility implementation.
