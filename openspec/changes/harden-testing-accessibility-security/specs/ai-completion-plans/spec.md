## ADDED Requirements

### Requirement: Completion-plan failure recovery
Completion-plan generation SHALL preserve existing task guidance and expose safe retryable feedback when provider, structured validation, concurrent-state, or persistence work fails.

#### Scenario: Provider or structured output fails
- **WHEN** Gemini rejects, times out, rate-limits, or returns an invalid summary or step collection
- **THEN** no completion guidance is persisted, existing guidance remains unchanged, and the user receives safe retry guidance

#### Scenario: Task changes while generation is in flight
- **WHEN** trusted task status or update time no longer matches the generation snapshot
- **THEN** stale output is discarded, existing current task data remains unchanged, and the user is prompted to retry from current content

#### Scenario: Completion-plan persistence fails
- **WHEN** validated output cannot be committed to the owned current task
- **THEN** the previous persisted guidance remains authoritative and the UI reports failure without displaying uncommitted output

#### Scenario: Failure is reported
- **WHEN** any expected completion-plan failure reaches the client
- **THEN** feedback exposes no provider key, private prompt context, query detail, or stack trace and the generation control becomes available again
