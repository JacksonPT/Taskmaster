## Why

The planned Module 13 notes/resources feature does not serve the user's intended Taskmaster workflow and would add relational data, authorization, validation, UI, and testing scope without meaningful product value. Removing it keeps the remaining roadmap focused on progress insight, quality, and shipping the project.

## What Changes

- Remove Module 13 task notes/resources from the remaining roadmap and remove its planned outcome requirement.
- Preserve the existing module numbers rather than rewriting project history; Module 14 progress dashboard becomes the next implementation target.
- Change the Module 14 prerequisite from completion of notes/resources to completion of Module 12 encouragement.
- Keep Modules 15 quality hardening and 16 deployment/portfolio readiness unchanged and in order.
- Update project context and README roadmap/status language to match the canonical roadmap.
- Do not add, remove, or modify application features, routes, components, Prisma models, migrations, Server Actions, AI behavior, dependencies, or persisted data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `project-learning-roadmap`: Remove the unused Module 13 outcome and make Module 14 the next planned module after completed Module 12 without renumbering Modules 14-16.

## Impact

- Planning contract: `openspec/specs/project-learning-roadmap/spec.md` after delta synchronization.
- Project context: `openspec/config.yaml` will identify Module 14 as next and list only Modules 14-16 as remaining.
- Documentation: `README.md` will omit Module 13 and identify the progress dashboard as next.
- No application code, database schema, runtime API, security boundary, or deployment behavior changes.
