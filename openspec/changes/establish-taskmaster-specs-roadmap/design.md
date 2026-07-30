## Context

Taskmaster has progressed from project setup through a production-style daily-planning workflow, but its behavior is currently documented across README history, source comments, Prisma migrations, and Git commits rather than a canonical specification baseline. A legacy ignored `specs/` tree contains a sidebar proposal, while the installed OpenSpec CLI expects a project-local `openspec/` root.

This change establishes that supported root, records completed Modules 1-11 as current capability requirements, implements Module 11.1 as the next UI refinement, and records Modules 12-16 as ordered future learning work. The primary stakeholder is a developer learning the stack module by module, so artifact structure and apply-time collaboration are part of the architecture rather than incidental documentation.

## Goals / Non-Goals

**Goals:**
- Make `Taskmaster/openspec/` the durable source of truth recognized by `/opsx-*` commands.
- Derive baseline capability requirements from current application behavior instead of inventing retrospective features.
- Keep completed behavior, security boundaries, AI contracts, and quota rules visible to future changes.
- Make the collapsible daily-plan sidebar the only application behavior implemented by this change.
- Sequence Modules 12-16 as separate future changes with explicit learning outcomes.
- Configure all future artifacts to request one focused user decision at a time and require useful top-down comments and module summaries.

**Non-Goals:**
- Reimplementing completed Modules 1-11.
- Implementing Modules 12-16 in this change.
- Changing Clerk ownership, Prisma data models, Gemini schemas, or daily-plan quotas during Module 11.1.
- Treating every implementation file as a separate capability.
- Preserving the unsupported legacy `Taskmaster/specs/` tree after canonical artifacts are validated.

## Decisions

### Use the standard project-local OpenSpec root

The canonical root will be `Taskmaster/openspec/`, with current specifications eventually synchronized into `openspec/specs/` and active changes in `openspec/changes/`. This layout is selected because the installed CLI resolves it natively and generated OpenCode skills/commands can operate without custom environment variables. Keeping top-level `Taskmaster/specs/` was rejected because `openspec context` does not recognize it and Git currently ignores it.

### Use behavior-oriented capability boundaries

The baseline groups related learning modules where they form one user-facing contract. For example, temporary task UI, lifecycle interactions, and later persistence are represented by `task-management`, while Prisma architecture has its own `database-persistence` contract. This avoids specs that merely mirror commit boundaries while retaining module traceability in requirement names and roadmap metadata.

### Represent future work in one roadmap capability

Modules 12-16 will be ordered in `project-learning-roadmap`, but their detailed product requirements will be created by future module-specific proposals. Creating full capability specs now was rejected because it would either imply unimplemented behavior is current or force one oversized apply operation, contrary to the one-module-at-a-time learning goal.

### Combine baseline establishment with Module 11.1

The apply phase will first establish and verify baseline documentation, then implement only the daily-plan sidebar. The sidebar defaults expanded, appears as a right-side column at wide breakpoints, collapses into a narrow reopenable rail, and stacks before tasks on smaller screens. Item reasons remain persisted but are omitted from the visible sheet; the plan-level summary remains.

This replacement honors the user's decision to supersede the legacy sidebar-only change while keeping its bounded implementation behavior.

### Put collaboration and teaching rules in project config

`openspec/config.yaml` supplies shared stack, security, roadmap, comment, verification, and collaboration constraints to every artifact. Apply task groups include explicit checkpoints so the implementation agent asks one important question, waits for one answer, and then proceeds. Batched questionnaires were rejected because they undermine incremental learning.

Useful code comments will explain client/server boundaries, collapse-state ownership, responsive grid switching, validated AI contracts, and concurrency controls. Comments that restate JSX, assignments, or obvious syntax remain out of scope.

### Preserve existing application boundaries during sidebar work

Module 11.1 changes only React/Tailwind presentation and documentation. Existing Server Actions, Prisma schema, AI prompts, lease-based quota accounting, manual reorder persistence, and focus sorting remain the source of behavior. The sidebar uses existing plan state and callbacks instead of creating duplicate state or new API paths.

## Risks / Trade-offs

- [Risk] Retrospective specs can drift from actual code. → Derive requirements from README, Git history, routes, actions, schema, and AI services, then verify representative scenarios against current files before archive.
- [Risk] A project-wide baseline change can become too large to review. → Keep capabilities behavior-oriented, concise, and split future feature detail into later changes.
- [Risk] Mixing specification setup and a UI module can blur completion. → Order tasks so baseline validation completes before any sidebar code edit and report each phase separately.
- [Risk] Removing the legacy ignored tree could discard useful sidebar decisions. → Recreate those decisions in the canonical proposal, design, spec, and tasks before deleting the old folder.
- [Risk] Expanded/collapsed desktop columns can make task cards too narrow. → Use a wide breakpoint, a flexible main column, an approximately 22rem expanded sidebar, and a 5rem collapsed rail; use one-column stacking below that breakpoint.
- [Risk] Future roadmap specs could be mistaken for implemented features. → State status and module order in the roadmap capability and require separate future changes before implementation.
- [Risk] Generated `.opencode/` integration can be overlooked by the current session. → Track the generated files and tell the user to restart OpenCode after the configuration change.

## Migration Plan

1. Initialize and configure `Taskmaster/openspec/` and OpenCode integration.
2. Create and strictly validate this replacement change and all baseline delta specs.
3. During apply, ask one focused baseline question, verify completed behavior against code, and synchronize/archive baseline specs when appropriate.
4. Ask one focused sidebar behavior question, then implement and verify Module 11.1.
5. Remove the superseded ignored `Taskmaster/specs/` tree and its ignore rule only after canonical artifacts are safe.
6. Continue Modules 12-16 through separate proposal/apply/archive cycles.

Rollback before archive consists of reverting the tracked `openspec/`, `.opencode/`, ignore-rule, sidebar component, dashboard layout, and README changes. No database rollback is required.

## Open Questions

None for proposal readiness. Module apply retains deliberate one-question checkpoints for visual details and future module decisions.
