## Why

Module 12 should make successful task completion feel rewarding instead of only moving a card into the completed state. A brief branded celebration gives immediate confirmation while teaching how client feedback can follow, but never control, a trusted server mutation.

## What Changes

- After an owned active task is successfully changed to Done by the existing Server Action, show a full-viewport warm amber pulse with centered `Task Complete!` text.
- Animate the celebration once for approximately 1.5 seconds, then remove it without requiring user dismissal.
- Keep the overlay non-interactive so it does not trap focus or block the workspace.
- Announce the successful completion to assistive technology and provide a non-strobing reduced-motion presentation.
- Trigger the celebration only for completion, not when reopening a completed task or when the server operation fails.
- Keep the message deterministic and ephemeral: no Gemini request, AI quota, database field, persistence, or replay after refresh.
- Update project documentation so Module 12 becomes complete and Module 13 notes/resources becomes the next proposal target.

## Capabilities

### New Capabilities

- `completion-encouragement`: Covers success-gated completion feedback, visual timing, accessibility, reduced motion, and non-persistent behavior.

### Modified Capabilities

None.

## Impact

- `components/tasks/task-dashboard.tsx`: detect the trusted returned Done status and own ephemeral celebration state.
- `app/globals.css`: define the branded overlay and reduced-motion animation behavior.
- `README.md` and `openspec/config.yaml`: record Module 12 and identify Module 13 as next.
- No changes to Prisma, migrations, Clerk ownership, Server Action contracts, Gemini prompts, AI quotas, or persisted task data.
