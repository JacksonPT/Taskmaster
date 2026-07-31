# project-learning-roadmap Specification

## Purpose
TBD - created by archiving change establish-taskmaster-specs-roadmap. Update Purpose after archive.
## Requirements
### Requirement: Beginning-to-end module record
The project specification set SHALL map completed Taskmaster work to an ordered learning module record from foundation through daily planning.

#### Scenario: Developer reviews completed roadmap
- **WHEN** a developer opens project context and baseline capability specs
- **THEN** Modules 1-11 are identifiable through product foundation, landing page, task management, persistence, authentication, ownership, AI priority, AI completion, and daily planning capabilities

### Requirement: Ordered remaining roadmap
After Module 11, Taskmaster SHALL plan remaining work in this order: 11.1 daily-plan sidebar, 12 completion encouragement, 13 task notes/resources, 14 progress dashboard, 15 testing/accessibility/security hardening, and 16 deployment/portfolio readiness.

#### Scenario: Current next module is selected
- **WHEN** the project is ready for its next application change
- **THEN** Module 11.1 sidebar refinement is completed before Module 12 begins

#### Scenario: Sidebar module completes
- **WHEN** Module 11.1 is verified and archived
- **THEN** Module 12 completion encouragement becomes the next proposal target

#### Scenario: Future work continues
- **WHEN** each remaining module completes
- **THEN** the next numbered module is proposed without combining multiple future modules into one implementation

### Requirement: Proposal before implementation
Each future module MUST have coherent proposal, design when warranted, capability spec, and task artifacts before application code changes begin.

#### Scenario: New module request begins
- **WHEN** the user asks to start a remaining module
- **THEN** OpenSpec artifacts define scope, decisions, requirements, dependencies, and verification before `/opsx-apply`

### Requirement: One-question-at-a-time collaboration
During apply, the implementation agent SHALL ask one focused important question before each major task group and SHALL wait for the answer instead of batching questions.

#### Scenario: Major implementation group begins
- **WHEN** work moves into a new design, data, AI, UI, or verification group that needs user preference
- **THEN** the agent asks one concise question and continues only after receiving that answer

### Requirement: Educational code comments
Each module SHALL add concise comments around non-obvious technology, security, data flow, AI validation, state ownership, or responsive behavior while avoiding comments that merely repeat syntax.

#### Scenario: Developer reads changed file top-down
- **WHEN** a module introduces non-obvious control flow or architectural boundaries
- **THEN** nearby comments explain why the approach exists and how data moves through it

### Requirement: Module completion report
Every completed module SHALL end with changed files in recommended reading order, simple explanations, verification results, a small flow, and reusable learning outcomes.

#### Scenario: Apply tasks finish
- **WHEN** implementation and required checks pass
- **THEN** the user receives a concise module report that supports reading and interview review

### Requirement: Module 12 completion encouragement outcome
The Module 12 proposal SHALL define contextual encouragement shown after a successful task completion without weakening trusted server status transitions.

#### Scenario: Module 12 is proposed
- **WHEN** sidebar refinement is complete
- **THEN** the proposal explores message source, generation limits, persistence needs, and completion UI before implementation

### Requirement: Module 13 notes and resources outcome
The Module 13 proposal SHALL define private notes and useful resources attached to owned tasks.

#### Scenario: Module 13 is proposed
- **WHEN** completion encouragement is complete
- **THEN** the proposal addresses data modeling, ownership, validation, editing, and responsive presentation

### Requirement: Module 14 progress dashboard outcome
The Module 14 proposal SHALL define meaningful completion, overdue, and progress metrics derived from trusted persisted task data.

#### Scenario: Module 14 is proposed
- **WHEN** notes and resources are complete
- **THEN** the proposal distinguishes useful derived metrics from decorative counters and defines their time boundaries

### Requirement: Module 15 quality hardening outcome
The Module 15 proposal SHALL cover automated testing, accessibility review, security regression checks, and failure-path resilience for the completed feature set.

#### Scenario: Module 15 is proposed
- **WHEN** the progress dashboard is complete
- **THEN** the proposal prioritizes risk-based tests and production-relevant accessibility and authorization checks

### Requirement: Module 16 deployment and portfolio outcome
The final module proposal SHALL cover deployment, environment configuration, CI checks, observability, final documentation, and portfolio presentation.

#### Scenario: Module 16 is proposed
- **WHEN** quality hardening is complete
- **THEN** the proposal defines production readiness and a verifiable public project narrative without exposing secrets

