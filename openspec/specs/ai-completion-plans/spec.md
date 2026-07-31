# ai-completion-plans Specification

## Purpose
TBD - created by archiving change establish-taskmaster-specs-roadmap. Update Purpose after archive.
## Requirements
### Requirement: Module 10 task completion plan
An authenticated owner SHALL be able to generate a structured completion plan for an existing active task using trusted database content.

#### Scenario: Generate plan for active owned task
- **WHEN** the owner activates Generate action plan
- **THEN** the server loads the owned task, calls Gemini once, and returns a validated summary with two to five ordered steps

#### Scenario: Generate plan for completed task
- **WHEN** the task is done
- **THEN** generation is unavailable until the task is reopened

#### Scenario: Generate plan for foreign task
- **WHEN** the submitted ID does not resolve under the authenticated user's ownership filter
- **THEN** no task context is sent to Gemini

### Requirement: Persistent completion guidance
Successful completion-plan output SHALL persist in PostgreSQL and remain visible after refresh.

#### Scenario: Plan generation succeeds
- **WHEN** Gemini output passes structured validation and the task remains current
- **THEN** Prisma stores the summary and ordered steps and the card displays them

### Requirement: Completion plan regeneration
An active task with an existing plan SHALL allow regeneration, replacing the previous summary and steps with one newly validated result.

#### Scenario: User regenerates task plan
- **WHEN** the owner activates Regenerate plan
- **THEN** one new Gemini request replaces the persisted completion guidance

### Requirement: Stale completion guidance protection
Task edits SHALL clear completion guidance, and a concurrent task change SHALL prevent an older in-flight generation from attaching stale output.

#### Scenario: User edits planned task
- **WHEN** valid task details are saved
- **THEN** the previous completion summary and steps are cleared

#### Scenario: Task changes during generation
- **WHEN** the task update timestamp or status changes before Gemini returns
- **THEN** the stale result is not persisted and the user is prompted to try again

### Requirement: Compact completion-plan presentation
Task cards SHALL hide the completion-plan panel until validated guidance exists and SHALL place Generate or Regenerate alongside the card lifecycle controls.

#### Scenario: Task has no plan
- **WHEN** an active task card renders without saved completion guidance
- **THEN** no empty plan panel consumes card space and Generate action plan remains available

