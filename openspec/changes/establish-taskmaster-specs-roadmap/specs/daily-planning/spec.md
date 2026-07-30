## ADDED Requirements

### Requirement: Module 11 whole-list planning
An authenticated user SHALL be able to generate one current focus plan from all owned active tasks, up to the configured maximum of 25 tasks, using one Gemini request.

#### Scenario: Generate daily plan
- **WHEN** the user has between one and 25 active tasks and available daily allowance
- **THEN** the server sends the bounded active-task snapshot to Gemini once and persists the validated ordered plan

#### Scenario: No active tasks
- **WHEN** the user requests planning with no active tasks
- **THEN** the action returns guidance without reserving quota or calling Gemini

#### Scenario: Too many active tasks
- **WHEN** more than 25 active tasks exist
- **THEN** the action rejects the request before reserving quota or calling Gemini

### Requirement: Semantic daily-plan validation
Gemini output MUST contain every supplied task ID exactly once, contain no unknown ID, and preserve each ID without normalization before persistence.

#### Scenario: Model omits, duplicates, changes, or invents an ID
- **WHEN** structured output violates the active-task identity set
- **THEN** application validation rejects the plan and no partial plan is saved

### Requirement: Two successful generations per UTC day
Each user SHALL receive at most two successful daily-plan generations per UTC calendar day: one initial plan and one regeneration.

#### Scenario: First and second successful requests
- **WHEN** a user has completed fewer than two successful generations for the UTC date
- **THEN** each accepted request may reserve one slot and increment successful usage only when plan persistence commits

#### Scenario: Third request
- **WHEN** successful usage plus active reservations occupies both daily slots
- **THEN** the server rejects another request and reports the UTC reset boundary

#### Scenario: Provider or persistence failure
- **WHEN** generation or transactional persistence fails
- **THEN** that request's unique reservation is released without incrementing successful usage

#### Scenario: Abandoned request
- **WHEN** an in-flight process cannot release its reservation
- **THEN** only that request's lease expires after the configured timeout and becomes reusable

### Requirement: Atomic current-plan persistence
Taskmaster SHALL store one current plan per user and SHALL replace its summary, ordered items, and successful usage count atomically.

#### Scenario: Regeneration commits
- **WHEN** validated output is saved
- **THEN** the new plan header, all ordered items, reservation removal, and successful usage increment commit together

### Requirement: Manual ordering without AI
Users SHALL be able to move tasks up or down in the saved plan, and the server SHALL persist the complete owned ID order without calling Gemini or changing quota.

#### Scenario: User moves a plan item
- **WHEN** the submitted ID set exactly matches the current owned plan
- **THEN** Prisma transactionally replaces item positions while preserving server-loaded reasons

#### Scenario: Reorder races with regeneration
- **WHEN** the plan changes after reorder data is read
- **THEN** optimistic version claiming rejects the stale reorder instead of mixing plan versions

### Requirement: Focus integration and snapshot behavior
Current plan order SHALL drive focus badges and active task-card sorting, while task changes after generation remain a visible snapshot until regeneration.

#### Scenario: Plan exists
- **WHEN** active task cards render with saved plan membership
- **THEN** planned tasks use focus positions before priority fallback and completed tasks remain last

#### Scenario: New task follows generation
- **WHEN** a task is created after the plan snapshot
- **THEN** it remains unplanned and uses normal priority sorting until a later allowed regeneration
