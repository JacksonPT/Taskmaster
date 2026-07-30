## ADDED Requirements

### Requirement: Module 5 PostgreSQL persistence foundation
Taskmaster SHALL store durable application data in PostgreSQL through Prisma's typed client and migration workflow.

#### Scenario: Server reads or writes application data
- **WHEN** a database-backed Server Component or Server Action accesses Taskmaster data
- **THEN** it uses the reusable Prisma client configured for the PostgreSQL adapter

### Requirement: Versioned schema evolution
Every persistent schema change SHALL be represented by `prisma/schema.prisma`, an applied migration, and regenerated Prisma types before dependent application code is considered complete.

#### Scenario: Persistent model changes
- **WHEN** a module adds or changes a database field, enum, relation, index, or constraint
- **THEN** Prisma validation, migration, and client generation complete successfully

### Requirement: Generated and secret data boundaries
Generated Prisma client files and real environment credentials MUST remain outside version control, while safe environment variable placeholders SHALL be documented.

#### Scenario: Repository changes are reviewed
- **WHEN** a developer inspects tracked files
- **THEN** generated client output and real `.env` values are absent while `.env.example` documents required names

### Requirement: Database constraints support application invariants
The schema SHALL use enums, defaults, relations, unique constraints, indexes, and cascading behavior where those guarantees belong in PostgreSQL.

#### Scenario: Related records are deleted
- **WHEN** a parent task or daily plan is removed
- **THEN** configured database relations clean up dependent planning records without orphaning them
