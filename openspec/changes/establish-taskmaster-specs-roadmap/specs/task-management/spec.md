## ADDED Requirements

### Requirement: Modules 3-4 task workspace
The authenticated workspace SHALL display each task's title, description, priority, status, optional due date, AI-related content when present, and available lifecycle controls.

#### Scenario: User has tasks
- **WHEN** the workspace loads owned task records
- **THEN** it renders task cards and summary counts using the current task values

#### Scenario: User has no tasks
- **WHEN** the workspace loads an empty owned task list
- **THEN** it displays a clear empty state and a way to add the first task

### Requirement: Validated task creation and editing
Users SHALL be able to create and edit tasks with required bounded title and description values, a known priority, and an optional due date, with validation enforced on the server.

#### Scenario: Valid task creation
- **WHEN** a signed-in user submits valid task details from the add panel
- **THEN** the new task is persisted and appears in the workspace without requiring a manual refresh

#### Scenario: Invalid task submission
- **WHEN** required fields are empty or bounded fields exceed server limits
- **THEN** the write is rejected and the user receives an actionable error

#### Scenario: Existing task edit
- **WHEN** a signed-in owner saves valid edits
- **THEN** the persisted row and visible card reflect the updated details

### Requirement: Task lifecycle operations
Users SHALL be able to delete, complete, and reopen owned tasks, and the server SHALL derive status transitions from trusted database state.

#### Scenario: Complete active task
- **WHEN** the owner activates Complete on an active task
- **THEN** the server marks it done and the workspace places it after active tasks

#### Scenario: Reopen completed task
- **WHEN** the owner activates Reopen on a done task
- **THEN** the server returns it to the active task workflow

#### Scenario: Delete task
- **WHEN** the owner deletes a task
- **THEN** its database row and visible card are removed

### Requirement: Module 6 durable workspace state
Task lifecycle results SHALL persist in PostgreSQL and remain visible after route refresh or a new authenticated request.

#### Scenario: Refresh after mutation
- **WHEN** a user refreshes after creating, editing, completing, reopening, or deleting a task
- **THEN** the workspace reflects the latest committed database state

### Requirement: Deterministic default ordering
Without an applicable daily-plan position, active tasks SHALL sort High, then Medium, then Low, while completed tasks remain last.

#### Scenario: Tasks have mixed priorities
- **WHEN** no daily focus position applies to active tasks
- **THEN** deterministic application code orders them by priority without an AI request
