# progress-dashboard Specification

## Purpose
Define trustworthy, deterministic productivity progress for an authenticated user's current tasks and daily focus plan.

## Requirements
### Requirement: Trusted completion timestamp

Taskmaster SHALL persist a nullable server-generated completion timestamp with task status so completion-period metrics do not rely on mutable update timestamps.

#### Scenario: Active task completes

- **WHEN** the authenticated owner successfully changes an active task to Done
- **THEN** the server stores Done status and the current completion timestamp in the same database update

#### Scenario: Completed task reopens

- **WHEN** the authenticated owner successfully reopens a Done task
- **THEN** the server stores an active status and clears the completion timestamp in the same database update

#### Scenario: Existing Done task has unknown history

- **WHEN** a pre-migration Done task has no completion timestamp
- **THEN** the application preserves the task but excludes it from time-bounded completion metrics

### Requirement: Focused productivity metrics

The authenticated workspace SHALL deterministically derive active, overdue, current-week completion, and active-priority metrics from the current user's loaded task records without an AI request.

#### Scenario: Active tasks are counted

- **WHEN** owned tasks are loaded or changed
- **THEN** every task whose status is not Done contributes to the active count

#### Scenario: Overdue active tasks are counted

- **WHEN** an active task has a due-date key earlier than the current UTC date key
- **THEN** it contributes to overdue count while a task due today or later does not

#### Scenario: Current UTC week completions are counted

- **WHEN** a currently Done task has a completion timestamp from Monday `00:00 UTC` through now
- **THEN** it contributes to completed-this-week count

#### Scenario: Active priorities are distributed

- **WHEN** active owned tasks have High, Medium, or Low priority
- **THEN** the dashboard reports each priority count and its proportion of active work

### Requirement: Current daily-focus progress

The dashboard SHALL report completed-versus-planned progress only for a saved daily plan whose plan date matches the current UTC date and SHALL use live owned task status.

#### Scenario: Current plan has visible items

- **WHEN** today's plan contains items that resolve to current owned tasks
- **THEN** the dashboard reports Done visible items over total visible items and a proportional progress value

#### Scenario: Plan item status changes

- **WHEN** a planned task is completed or reopened
- **THEN** focus progress updates from current client state without regenerating the plan or calling Gemini

#### Scenario: No current plan exists

- **WHEN** no plan exists or the saved plan date is not the current UTC date
- **THEN** the dashboard presents a clear no-current-plan state rather than yesterday's progress

### Requirement: Responsive progress presentation

The progress dashboard SHALL present its metrics in the established Taskmaster visual language and remain readable without horizontal overflow on desktop and narrow screens.

#### Scenario: Wide workspace

- **WHEN** the dashboard has wide-screen space
- **THEN** summary metrics and distributions use a scannable multi-column hierarchy

#### Scenario: Narrow workspace

- **WHEN** the viewport cannot support the wide hierarchy
- **THEN** metrics stack or wrap with readable labels, values, and progress indicators

#### Scenario: Workspace state changes

- **WHEN** task or current-plan state changes successfully in the client
- **THEN** affected metrics update without requiring a page refresh

### Requirement: Dashboard data boundaries

Progress metrics MUST use only authenticated user-owned records already returned by existing scoped reads and MUST NOT add Gemini calls, AI quota usage, cross-user comparisons, or invented historical values.

#### Scenario: Dashboard renders

- **WHEN** an authenticated user views progress
- **THEN** all values derive from that user's scoped task and daily-plan data

#### Scenario: Metric calculation runs

- **WHEN** tasks or plan items are counted or grouped
- **THEN** deterministic application code performs the calculation with no provider request or quota change
