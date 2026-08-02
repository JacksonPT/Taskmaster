## MODIFIED Requirements

### Requirement: Focused productivity metrics
The authenticated workspace SHALL deterministically derive active, overdue, and current-week completion metrics from the current user's loaded task records without an AI request.

#### Scenario: Active tasks are counted
- **WHEN** owned tasks are loaded or changed
- **THEN** every task whose status is not Done contributes to the active count

#### Scenario: Overdue active tasks are counted
- **WHEN** an active task has a due-date key earlier than the current UTC date key
- **THEN** it contributes to overdue count while a task due today or later does not

#### Scenario: Current UTC week completions are counted
- **WHEN** a currently Done task has a completion timestamp from Monday `00:00 UTC` through now
- **THEN** it contributes to completed-this-week count

### Requirement: Responsive progress presentation
The progress dashboard SHALL appear as one compact full-width metric ribbon below the `Command Center` title and above task controls/cards, SHALL contain only Active, Overdue, Completed this week, and Daily focus, and SHALL remain readable without horizontal overflow.

#### Scenario: Wide workspace
- **WHEN** the dashboard reaches the configured wide breakpoint
- **THEN** all four metrics appear in one horizontal row of visually connected cells

#### Scenario: Intermediate workspace
- **WHEN** four readable cells cannot fit in one row
- **THEN** the ribbon wraps into two columns without becoming a separate oversized panel

#### Scenario: Narrow workspace
- **WHEN** the viewport cannot support two readable columns
- **THEN** metric cells stack with readable labels, values, details, and icons

#### Scenario: Workspace state changes
- **WHEN** task or current-plan state changes successfully in the client
- **THEN** affected ribbon metrics update without requiring a page refresh
