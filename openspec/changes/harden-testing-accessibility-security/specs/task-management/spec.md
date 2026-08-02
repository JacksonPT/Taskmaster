## MODIFIED Requirements

### Requirement: Validated task creation and editing
Users SHALL be able to create and edit tasks with required bounded title and description values, a known priority, and an optional valid date, with runtime validation enforced on the server before database access.

#### Scenario: Valid task creation
- **WHEN** a signed-in user submits valid task details from the add panel
- **THEN** the new task is persisted and appears in the workspace without requiring a manual refresh

#### Scenario: Invalid task submission
- **WHEN** required fields are empty, bounded fields exceed server limits, priority is unknown, or the optional date is malformed
- **THEN** the write is rejected before Prisma mutation and the user receives an actionable field-associated error

#### Scenario: Existing task edit
- **WHEN** a signed-in owner saves valid edits
- **THEN** the persisted row and visible card reflect the updated details

#### Scenario: Invalid direct action input
- **WHEN** a caller bypasses the form and submits malformed task data or an invalid identifier directly to a Server Action
- **THEN** runtime validation returns a safe failure before private record lookup, mutation, or provider work

### Requirement: Task lifecycle operations
Users SHALL be able to delete, complete, and reopen owned tasks, the server SHALL derive status transitions from trusted database state, and pending or failed lifecycle operations SHALL not create duplicate requests or incorrect client success state.

#### Scenario: Complete active task
- **WHEN** the owner activates Complete on an active task and the database update succeeds
- **THEN** the server marks it done, the workspace places it after active tasks, and trusted success triggers completion feedback

#### Scenario: Reopen completed task
- **WHEN** the owner activates Reopen on a done task and the database update succeeds
- **THEN** the server returns it to the active task workflow

#### Scenario: Delete task
- **WHEN** the owner deletes a task and the database update succeeds
- **THEN** its database row and visible card are removed

#### Scenario: Lifecycle operation is pending
- **WHEN** delete, complete, or reopen is awaiting a response
- **THEN** the corresponding task action prevents duplicate activation while unrelated task controls remain usable where safe

#### Scenario: Lifecycle operation fails
- **WHEN** delete, complete, or reopen fails validation, authorization, network, or database work
- **THEN** the visible task state remains unchanged, an actionable error is announced, the action becomes available again, and no completion celebration appears
