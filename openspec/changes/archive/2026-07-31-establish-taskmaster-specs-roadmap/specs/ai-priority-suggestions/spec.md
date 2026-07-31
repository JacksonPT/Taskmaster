## ADDED Requirements

### Requirement: Module 9 structured priority recommendation
An authenticated user SHALL be able to request one Gemini priority recommendation for bounded task form data and receive a validated High, Medium, or Low value plus a concise rationale.

#### Scenario: Valid priority request
- **WHEN** a signed-in user supplies a valid title, description, and optional due date
- **THEN** the server returns a Zod-validated priority and explanation without exposing the provider key

#### Scenario: Invalid priority request
- **WHEN** required task context is empty or outside runtime bounds
- **THEN** the Server Action rejects the request before calling Gemini

### Requirement: Human priority control
The recommended priority SHALL populate the form as a suggestion that the user can override before saving.

#### Scenario: User accepts recommendation
- **WHEN** the user saves the task without changing the AI priority
- **THEN** the priority and rationale persist with the task

#### Scenario: User manually changes priority
- **WHEN** the user selects a different priority after generation
- **THEN** the stale AI rationale is cleared before persistence

### Requirement: Priority rationale freshness
Changing task title, description, or due date after generation SHALL clear the rationale generated from the previous form context.

#### Scenario: Task context changes
- **WHEN** the user edits a field that informed the recommendation
- **THEN** the form no longer presents the old explanation as current

### Requirement: Deterministic priority ordering
Accepted task priorities SHALL drive active-task ordering through application code and MUST NOT require an additional Gemini comparison request.

#### Scenario: Priority suggestion is saved
- **WHEN** the task enters the workspace without a daily focus position
- **THEN** its priority rank determines its relative active-task position
