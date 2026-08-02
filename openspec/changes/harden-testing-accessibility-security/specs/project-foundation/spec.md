## MODIFIED Requirements

### Requirement: Supported development workflow
The project SHALL provide package scripts for local development, production builds, linting, formatting, TypeScript checking, Prisma generation, migrations, database inspection, fast automated tests, isolated integration tests, browser tests, accessibility checks, and aggregate local verification.

#### Scenario: Developer inspects project scripts
- **WHEN** a developer opens `package.json`
- **THEN** the documented development, database, unit/component test, integration test, browser test, accessibility, and aggregate quality workflows are available through pnpm scripts

#### Scenario: Test command generates artifacts
- **WHEN** a test command produces coverage, browser reports, traces, screenshots, or temporary authentication state
- **THEN** generated artifacts and real test credentials remain outside version control
