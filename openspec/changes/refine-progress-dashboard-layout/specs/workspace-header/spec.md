## ADDED Requirements

### Requirement: Simplified command-center identity
The authenticated task workspace SHALL present exact title `Command Center` without the previous database eyebrow, oversized task-command-center heading, or explanatory PostgreSQL paragraph.

#### Scenario: Workspace header renders
- **WHEN** an authenticated user opens `/tasks`
- **THEN** the primary workspace identity is the concise `Command Center` title

### Requirement: Shared Taskmaster brand mark
The workspace title row SHALL place the same Taskmaster SVG brand mark used by the landing page at the upper right without duplicating its implementation.

#### Scenario: Brand mark renders beside title
- **WHEN** the workspace identity row has sufficient width
- **THEN** `Command Center` appears on the left and the shared brand mark appears on the right

#### Scenario: Brand mark renders on a narrow screen
- **WHEN** the title row appears on a narrow viewport
- **THEN** the title and compact mark remain visible without overlap or horizontal overflow

### Requirement: Preserve workspace navigation
Header simplification MUST preserve the existing back-to-landing navigation and Clerk user session control above the title row.

#### Scenario: User inspects top navigation
- **WHEN** the simplified workspace loads
- **THEN** the back link and authenticated user control remain available and keyboard accessible
