## ADDED Requirements

### Requirement: Layered local quality workflow
Taskmaster SHALL provide documented pnpm commands for fast unit and component tests, isolated PostgreSQL integration tests, browser end-to-end and accessibility tests, and one aggregate local verification workflow.

#### Scenario: Developer checks a focused change
- **WHEN** a developer runs the fast test command
- **THEN** deterministic helpers, schemas, service boundaries, and interactive components execute without requiring PostgreSQL, Clerk test credentials, or Gemini

#### Scenario: Developer completes Module 15 verification
- **WHEN** the full documented local quality workflow runs with its required isolated test resources
- **THEN** unit, component, integration, browser, accessibility, lint, type, build, and OpenSpec checks report deterministic pass or failure results

### Requirement: Isolated external test resources
Automated tests MUST NOT use production data, production credentials, personal Clerk accounts, or live Gemini requests, and database integration tests MUST target an explicit disposable test database through a dedicated environment variable.

#### Scenario: Gemini behavior is tested
- **WHEN** a test covers AI success, rejection, timeout, rate limit, or malformed output
- **THEN** it uses a controlled provider boundary and consumes no live provider quota

#### Scenario: Integration database is not configured
- **WHEN** a database integration command starts without its dedicated test database variable
- **THEN** it fails safely before connecting instead of falling back to the application database

#### Scenario: Integration suite finishes
- **WHEN** database-backed tests pass or fail
- **THEN** their user, task, plan, item, usage, and reservation records are isolated and cleaned without modifying non-test data

### Requirement: Risk-based security regression coverage
The automated suite SHALL prove authentication-before-I/O and user-owned data isolation across workspace reads, task lifecycle actions, AI actions, daily planning, and plan reordering.

#### Scenario: Signed-out caller invokes a private operation
- **WHEN** a private Server Action or workspace loader receives no authenticated Clerk user ID
- **THEN** regression coverage verifies rejection occurs before Prisma access, provider calls, or quota reservation

#### Scenario: User submits another user's identifier
- **WHEN** one test user attempts to read, mutate, generate from, or reorder records owned by another test user
- **THEN** regression coverage verifies no private data is returned, no mutation occurs, and no provider or quota work begins

#### Scenario: Legacy task has no owner
- **WHEN** an authenticated test user loads private records while a null-owned task exists
- **THEN** regression coverage verifies the legacy row remains invisible and unclaimed

### Requirement: Accessible interaction baseline
Taskmaster SHALL support keyboard operation, visible focus, programmatic labels and errors, announced asynchronous feedback, reduced motion, and responsive reflow without relying on an unmodified character-key shortcut.

#### Scenario: Keyboard user opens and closes a dynamic task panel
- **WHEN** the user activates Add, Edit, Cancel, or Save without a pointer
- **THEN** focus moves to useful panel content when opened and returns to an appropriate initiating control when closed

#### Scenario: Form submission fails validation
- **WHEN** a task field is invalid
- **THEN** the field exposes its invalid state and associated actionable error to assistive technology

#### Scenario: Asynchronous operation succeeds or fails
- **WHEN** a task, AI, or planning action resolves
- **THEN** important status or error feedback is announced without stealing focus or exposing provider internals

#### Scenario: Workspace is audited across user settings
- **WHEN** automated axe checks and the documented manual keyboard, zoom, contrast, reflow, and reduced-motion checks run
- **THEN** no unresolved serious accessibility violation, keyboard trap, inaccessible control, or horizontal page overflow remains

### Requirement: Recoverable failure behavior
Expected validation, provider, network, and database failures SHALL preserve the last committed client state, expose actionable retry guidance, and prevent duplicate activation, stale persistence, quota leakage, or false success feedback.

#### Scenario: Client mutation is pending
- **WHEN** a user starts a task, AI, or planning mutation
- **THEN** the initiating control prevents duplicate activation until that request settles

#### Scenario: Expected mutation fails
- **WHEN** validation, provider, network, or database work returns a handled failure
- **THEN** the UI retains committed data, announces a safe error, re-enables the relevant action, and shows no completion celebration or other success state

#### Scenario: Initial workspace load fails unexpectedly
- **WHEN** the authenticated task route cannot load required private data
- **THEN** a route error boundary presents a recoverable retry path without exposing credentials, queries, stack traces, or another user's data

### Requirement: Deterministic domain regression coverage
Time boundaries, progress metrics, task ordering, input normalization, structured AI schemas, semantic task-ID validation, and quota accounting SHALL be tested with explicit inputs rather than wall-clock, provider, or network dependence.

#### Scenario: UTC behavior is tested
- **WHEN** tests cover day rollover, Monday week start, overdue dates, or lease expiry
- **THEN** they inject or fix time and assert UTC boundary behavior deterministically

#### Scenario: Structured AI output is invalid
- **WHEN** controlled output omits, duplicates, alters, invents, underfills, overfills, or exceeds a bounded field
- **THEN** validation rejects it before persistence and the test verifies no state or quota side effect occurs
