# user-authentication Specification

## Purpose
TBD - created by archiving change establish-taskmaster-specs-roadmap. Update Purpose after archive.
## Requirements
### Requirement: Module 7 Clerk authentication
Taskmaster SHALL use Clerk for sign-in, sign-up, session handling, and user session controls.

#### Scenario: User signs in
- **WHEN** a visitor completes Clerk authentication
- **THEN** the application recognizes the session and offers access to the private workspace

### Requirement: Protected task workspace
The `/tasks` route SHALL require an authenticated Clerk session before loading private database data or rendering the dashboard.

#### Scenario: Signed-out workspace request
- **WHEN** a signed-out visitor requests `/tasks`
- **THEN** the route redirects to Clerk sign-in with a return path to the workspace

#### Scenario: Signed-in workspace request
- **WHEN** an authenticated user requests `/tasks`
- **THEN** the route loads that user's workspace data dynamically

### Requirement: Action-level authentication
Every Server Action that reads, mutates, or generates private task data MUST verify the Clerk session independently of page-level protection.

#### Scenario: Direct unauthenticated action request
- **WHEN** a caller invokes a task or AI Server Action without an authenticated user ID
- **THEN** the action rejects the operation before private database access or Gemini quota consumption

