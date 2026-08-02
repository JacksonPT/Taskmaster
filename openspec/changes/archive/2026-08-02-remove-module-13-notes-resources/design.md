## Context

Modules 1-12 and the Module 11.1 sidebar refinement are complete. The canonical learning roadmap currently plans Module 13 task notes/resources before Module 14 progress dashboard, but no Module 13 proposal, application code, database model, migration, or persisted data exists. The user has confirmed that notes/resources do not serve their intended workflow and wants Module 14 to become next.

This is a planning-contract correction across the canonical roadmap, project-local OpenSpec context, and README. It does not change the running application.

## Goals / Non-Goals

**Goals:**

- Remove the unimplemented notes/resources module from all current roadmap sources.
- Make Module 14 progress dashboard the explicit next proposal target after completed Module 12.
- Keep Modules 14, 15, and 16 numbered as originally recorded.
- Preserve coherent prerequisite language so future OpenSpec instructions do not wait for removed work.
- Teach intentional scope reduction and roadmap consistency.

**Non-Goals:**

- Renumbering Modules 14-16 to close the numeric gap.
- Replacing Module 13 with another feature or retaining a placeholder.
- Designing or implementing the progress dashboard in this change.
- Removing any completed feature, capability spec, database model, migration, route, action, or dependency.
- Changing authentication, authorization, AI, quota, persistence, responsive UI, or deployment behavior.

## Decisions

### Preserve historical module numbers

Modules 14-16 keep their existing identifiers, and the roadmap will intentionally skip Module 13. This avoids rewriting archived proposals, prior explanations, and established references merely to make numbering contiguous.

The alternative is to rename Modules 14-16 as 13-15. That creates unnecessary documentation churn and makes historical roadmap references harder to follow.

### Remove the planned outcome rather than mark it deferred

The `Module 13 notes and resources outcome` requirement will be removed because the user has no product use for it. Leaving it marked deferred would keep ambiguity about whether the project is complete without it.

### Connect Module 14 directly to Module 12

The Module 14 requirement will use completed encouragement as its prerequisite. This is the actual current state and ensures the next proposal can begin without a nonexistent Module 13 artifact.

### Keep implementation scope documentation-only

Apply will edit `README.md` and `openspec/config.yaml`; the delta spec will update the canonical roadmap during sync/archive. No application code should be touched. Existing security, quota, persistence, and responsive behavior therefore carry no migration risk.

### Avoid application-code comments

No learning comments are needed because this change modifies planning prose rather than non-obvious runtime control flow. Comments in application code would be unrelated noise.

## Risks / Trade-offs

- [Risk] A numbering gap may look accidental. -> State explicitly that Module 13 was removed by scope decision and Module 14 is next.
- [Risk] One roadmap source could continue naming notes/resources. -> Search canonical specs, OpenSpec context, README, and active artifacts, then validate the final change strictly.
- [Risk] Archived historical changes still mention the old roadmap. -> Preserve archives as historical records and update only current canonical sources.
- [Trade-off] Taskmaster loses a relational-resource CRUD learning exercise. -> Prioritize features the user values and retain relational, ownership, and validation learning in existing capabilities.

## Migration Plan

1. Confirm once during apply that Module 14 remains numbered 14 and no replacement Module 13 is desired.
2. Update README and OpenSpec project context to omit Module 13 and name Module 14 as next.
3. Search current non-archived roadmap sources for stale notes/resources prerequisites.
4. Run strict OpenSpec validation, formatting as applicable, and `git diff --check`.

Rollback restores the three roadmap references. No application or data migration is required.

## Open Questions

None. The user explicitly requested removal without replacement and selected Module 14 as the next implementation target.
