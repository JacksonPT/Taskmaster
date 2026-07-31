## ADDED Requirements

### Requirement: Success-gated completion celebration
The authenticated task workspace SHALL celebrate only after the existing server-authoritative lifecycle action successfully returns an owned task in the Done state.

#### Scenario: Active task completes successfully
- **WHEN** the owner completes an active task and the Server Action returns that task with status Done
- **THEN** the workspace updates the task and starts one completion celebration

#### Scenario: Completed task is reopened
- **WHEN** the owner reopens a completed task and the Server Action returns that task with an active status
- **THEN** the workspace updates the task without starting a completion celebration

#### Scenario: Lifecycle action fails
- **WHEN** authentication, ownership, lookup, or persistence prevents the completion action from succeeding
- **THEN** no completion celebration appears

### Requirement: Branded transient presentation
The completion celebration SHALL present one non-strobing warm amber full-viewport pulse with centered exact text `Task Complete!` for approximately 1.5 seconds and SHALL then remove itself automatically.

#### Scenario: Celebration renders on a wide screen
- **WHEN** a successful completion starts the effect on a desktop viewport
- **THEN** the amber layer and centered message cover the viewport without changing the underlying dashboard layout

#### Scenario: Celebration renders on a narrow screen
- **WHEN** a successful completion starts the effect on a mobile viewport
- **THEN** the centered message remains readable without horizontal overflow

#### Scenario: Celebration finishes
- **WHEN** the single animation sequence reaches its end
- **THEN** the visual layer is removed without requiring dismissal

### Requirement: Non-modal accessible feedback
The celebration MUST preserve current focus and pointer interaction, MUST expose `Task Complete!` as a polite atomic status message, and MUST provide a reduced-motion presentation without scale pulsing.

#### Scenario: Keyboard user completes a task
- **WHEN** the celebration appears while a control has keyboard focus
- **THEN** focus remains unchanged and the overlay does not trap or intercept interaction

#### Scenario: Assistive technology receives feedback
- **WHEN** the completion celebration mounts
- **THEN** the exact success message is announced as non-urgent status feedback

#### Scenario: User prefers reduced motion
- **WHEN** the operating system requests reduced motion
- **THEN** the feedback uses a short opacity-only transition without pulsing or strobing

### Requirement: Deterministic ephemeral behavior
Completion encouragement SHALL remain client-side presentation state and MUST NOT call Gemini, consume AI quota, add persisted data, or replay after navigation or refresh.

#### Scenario: Completion is celebrated
- **WHEN** the transient message appears and fades
- **THEN** no AI request or database write occurs beyond the existing task status mutation

#### Scenario: Workspace reloads
- **WHEN** the user refreshes or later returns after a completed task was celebrated
- **THEN** no prior celebration is reconstructed from persisted task data
