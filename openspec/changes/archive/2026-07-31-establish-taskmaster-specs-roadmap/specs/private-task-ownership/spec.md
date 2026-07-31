## ADDED Requirements

### Requirement: Module 8 server-derived ownership
Task ownership SHALL be assigned from the authenticated Clerk user ID on the server and MUST NOT be accepted from browser-controlled task input.

#### Scenario: User creates a task
- **WHEN** an authenticated user submits valid task content
- **THEN** the server writes the current Clerk user ID as the ownership key

### Requirement: User-scoped data isolation
Every private task read, update, delete, status transition, and task-specific AI lookup MUST include the authenticated user's ownership key in its database criteria.

#### Scenario: User loads task workspace
- **WHEN** an authenticated user requests tasks
- **THEN** PostgreSQL returns only rows whose ownership key matches that user

#### Scenario: User guesses another task ID
- **WHEN** a user submits an ID belonging to another user
- **THEN** the operation returns no private record and performs no mutation or AI generation for it

### Requirement: Ownership query performance
PostgreSQL SHALL index the task ownership key used by user-scoped queries.

#### Scenario: Owned task collection grows
- **WHEN** Prisma filters tasks by Clerk user ID
- **THEN** PostgreSQL can use the ownership index rather than requiring an unindexed full-table lookup

### Requirement: Legacy null-owned rows remain private
Development rows without an ownership key SHALL not appear in any authenticated user's task list.

#### Scenario: Legacy row has null ownership
- **WHEN** an authenticated workspace query runs
- **THEN** the null-owned row is excluded without assigning it to the current user
