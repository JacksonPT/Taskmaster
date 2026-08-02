## Why

Module 15 should turn Taskmaster's existing type, lint, build, and manual checks into a risk-based quality system that can detect regressions in ownership, AI validation, quota accounting, accessibility, and user-visible failure behavior. This is needed before deployment because the highest-impact boundaries currently have no automated tests, and several database or network failures can reject without recoverable UI feedback.

## What Changes

### Current Behavior

- The project has no test runner, test configuration, automated test files, browser checks, or dedicated integration-test database workflow.
- Authentication, ownership, structured AI output, daily-plan reservations, UTC metrics, sorting, and completion state rely on implementation discipline plus manual verification.
- Create and edit expose some actionable errors, while delete, complete, reopen, and initial workspace-load failures lack consistent pending, recovery, and announcement behavior.
- Accessibility uses several strong local patterns, but keyboard focus, unmodified character shortcuts, form error associations, reduced motion, zoom/reflow, contrast, and live announcements have not been audited as one system.

### Requested Behavior

- Add Vitest and React Testing Library for deterministic helpers, schemas, server-side service boundaries, and interactive components.
- Add Playwright and axe-backed browser checks for route protection, responsive layout, keyboard paths, reduced motion, and serious accessibility violations without making live Gemini requests.
- Add an isolated PostgreSQL integration-test path for ownership, constraints, completion timestamps, reservation concurrency, lease expiry, rollback, and reorder/regeneration races.
- Extract only the deterministic or dependency-injected seams needed to test UTC calculations, sorting, task validation, AI semantic validation, and quota transactions without changing product rules.
- Enforce runtime validation for browser-controlled task inputs and identifiers before database or provider work.
- Add stable pending, error, retry, and state-preservation behavior for task mutations, AI/provider failures, database failures, and initial workspace loading.
- Add security regression coverage proving signed-out requests stop before private I/O and one user cannot read, mutate, generate from, or reorder another user's records.
- Remove or replace the unmodified global theme character shortcut and harden form semantics, focus management, status announcements, and failure feedback.
- Document local quality commands, safe test credentials/data, required manual accessibility checks, and Module 16 as the next roadmap step.

### Non-Goals

- Do not add deployment configuration, GitHub Actions or other CI workflows, production observability, alerting, or portfolio presentation; those remain Module 16.
- Do not use personal Clerk credentials, production data, a production database, or live Gemini quota in ordinary automated tests.
- Do not redesign task cards, daily planning, progress metrics, AI prompts, quota limits, ownership policy, or database schema except where a proven testability or failure-recovery defect requires the smallest compatible change.
- Do not pursue arbitrary repository-wide coverage percentages or snapshot-heavy tests; prioritize behavioral assertions at security, persistence, validation, accessibility, and recovery boundaries.

## Capabilities

### New Capabilities

- `quality-hardening`: Defines the local automated test layers, isolated data/provider rules, risk-based security regressions, accessibility acceptance checks, and repeatable quality verification for Module 15.

### Modified Capabilities

- `project-foundation`: Add supported local unit, component, integration, end-to-end, and accessibility test commands plus safe generated-artifact and test-environment conventions.
- `task-management`: Enforce runtime task input validation and recoverable pending/error behavior that never mutates local state or celebrates a failed lifecycle action.
- `ai-priority-suggestions`: Define stable provider and malformed-output failure behavior with no persistence or provider-detail leakage.
- `ai-completion-plans`: Preserve existing guidance and expose retryable feedback when provider, validation, persistence, or concurrent-state checks fail.
- `daily-planning`: Make provider/database failures recoverable while preserving exact reservation cleanup, successful-use accounting, and no-live-AI test guarantees.
- `project-learning-roadmap`: Record Module 15 quality hardening as complete after verification and retain Module 16 deployment/portfolio readiness as the next module.

## Impact

- Test tooling and configuration: `package.json`, lockfile, Vitest projects/setup, Testing Library, Playwright, axe, test artifact ignores, and safe test environment documentation.
- Testability seams: deterministic date/metric/sorting helpers, runtime task schemas, AI semantic validators, authenticated action/service adapters, and daily-plan quota persistence boundaries.
- Failure UX: task Server Actions and dashboard state, AI actions, `/tasks` route recovery, form semantics, focus ownership, pending controls, and accessible status/error announcements.
- Automated coverage: focused unit/component tests, mocked provider and authorization tests, real isolated PostgreSQL integration tests, and browser accessibility/responsive smoke tests.
- Documentation and OpenSpec context: Module 15 commands, test-data safety, manual audit checklist, and Module 16 handoff.
- No production secrets, live Gemini calls, production database access, deployment workflow, or intentional persisted-data migration is introduced.
