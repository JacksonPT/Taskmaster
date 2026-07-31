## MODIFIED Requirements

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
