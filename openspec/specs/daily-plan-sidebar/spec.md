# daily-plan-sidebar Specification

## Purpose
TBD - created by archiving change establish-taskmaster-specs-roadmap. Update Purpose after archive.
## Requirements
### Requirement: Module 11.1 responsive sidebar
When a saved daily plan exists, the dashboard SHALL present it before the task-card area as a left sidebar on wide screens and SHALL reserve no sidebar space when no plan exists.

#### Scenario: Wide dashboard with plan
- **WHEN** the viewport reaches the configured wide breakpoint
- **THEN** the daily plan uses a left-side sidebar column and task cards use the flexible right column

#### Scenario: Narrow dashboard with plan
- **WHEN** the viewport cannot support readable side-by-side columns
- **THEN** the plan remains before the task-card area in document and visual order without horizontal overflow

#### Scenario: No plan
- **WHEN** no current daily plan exists
- **THEN** the task-card area uses the full available width

### Requirement: Expanded default and true collapse
The saved sidebar SHALL start expanded and SHALL let users collapse it into a narrow reopenable desktop rail without changing plan data.

#### Scenario: Saved plan first loads
- **WHEN** the dashboard receives a current plan
- **THEN** its summary and ordered task rows are visible by default

#### Scenario: User collapses sidebar
- **WHEN** the user activates Collapse daily plan
- **THEN** the content hides and the wide-screen grid changes from the expanded sidebar width to a narrow rail

#### Scenario: User expands sidebar
- **WHEN** the user activates Expand daily plan
- **THEN** the unchanged summary and task order become visible again

### Requirement: Accessible collapse control
The collapse control MUST expose its expanded state, controlled region, and an explicit accessible label.

#### Scenario: Assistive technology inspects toggle
- **WHEN** the sidebar is expanded or collapsed
- **THEN** the control reports `aria-expanded`, references the controlled content, and identifies the available action

### Requirement: Summary-only explanation
The expanded sidebar SHALL display the plan date, visible task count, and main summary but SHALL NOT display stored per-task rationale text.

#### Scenario: Expanded plan content
- **WHEN** the daily sidebar is open
- **THEN** each task row shows only its position, live status, title, and reorder controls beneath the plan-level explanation

### Requirement: Preserve planning interactions
Sidebar presentation changes MUST preserve persisted Move Up and Move Down behavior, focus badges, task-card ordering, completed-task styling, and zero-AI reordering.

#### Scenario: User moves task in sidebar
- **WHEN** an available movement control is activated
- **THEN** the existing reorder action persists the new order and the dashboard updates focus positions without a Gemini call

#### Scenario: Task is at movement boundary
- **WHEN** a task is first or last
- **THEN** the unavailable movement direction is disabled
