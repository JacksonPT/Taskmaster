## ADDED Requirements

### Requirement: Recoverable daily-planning failures

Daily-plan generation and reordering SHALL return safe recoverable failure outcomes while preserving the last committed plan, exact successful-use count, ownership boundaries, and request-specific reservation rules.

#### Scenario: Initial owned-task or plan lookup fails

- **WHEN** PostgreSQL cannot load the records required to generate or reorder a plan
- **THEN** the action returns retry guidance without calling Gemini, reserving quota, changing usage, or replacing the current plan

#### Scenario: Generation fails after reservation

- **WHEN** provider, semantic validation, or transactional persistence fails after a request acquires a lease
- **THEN** only that request's reservation is released, successful usage does not increment, the previous plan remains current, and safe retry guidance is returned

#### Scenario: Reservation cleanup also fails

- **WHEN** the server cannot explicitly release the failed request's reservation
- **THEN** the lease remains bounded by its existing expiry and cleanup does not delete a newer request's reservation

#### Scenario: Reorder fails

- **WHEN** ownership validation, stale-version detection, network work, or persistence rejects a manual reorder
- **THEN** no Gemini call or quota change occurs and the client restores or reloads the last committed order with actionable feedback

#### Scenario: Planning action settles

- **WHEN** a generation or reorder request succeeds or fails
- **THEN** pending controls re-enable, duplicate requests were prevented, and feedback exposes no prompt, provider credential, database query, or cross-user data
