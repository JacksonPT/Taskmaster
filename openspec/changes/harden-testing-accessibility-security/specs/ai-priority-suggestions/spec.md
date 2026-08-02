## MODIFIED Requirements

### Requirement: Module 9 structured priority recommendation
An authenticated user SHALL be able to request one Gemini priority recommendation for bounded task form data and receive either a validated High, Medium, or Low value with a concise rationale or safe retryable failure feedback.

#### Scenario: Valid priority request
- **WHEN** a signed-in user supplies a valid title, description, and optional due date and Gemini returns valid structured output
- **THEN** the server returns a Zod-validated priority and explanation without exposing the provider key

#### Scenario: Invalid priority request
- **WHEN** required task context is empty or outside runtime bounds
- **THEN** the Server Action rejects the request before calling Gemini

#### Scenario: Provider or structured output fails
- **WHEN** Gemini is unavailable, times out, rate-limits the request, or returns output that fails validation
- **THEN** the action returns safe retry guidance, exposes no provider detail or secret, and persists no suggestion

#### Scenario: Provider configuration is absent
- **WHEN** the server-only Gemini credential is unavailable
- **THEN** the action returns a stable configuration failure without attempting a request or exposing environment values
