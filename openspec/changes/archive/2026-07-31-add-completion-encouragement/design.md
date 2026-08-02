## Context

`TaskDashboard` already calls the authenticated `toggleTaskComplete` Server Action, receives the database-backed updated task, and replaces that task in client state. The server derives the transition from owned PostgreSQL state, so the returned status is the trustworthy point at which the client knows whether the operation completed or reopened a task. Module 12 adds transient feedback after that success without changing the mutation contract or storing presentation state.

The selected visual direction is one non-strobing warm amber full-screen pulse with centered `Task Complete!` text over approximately 1.5 seconds. The effect must remain readable on mobile and desktop and must respect reduced-motion preferences.

## Goals / Non-Goals

**Goals:**

- Celebrate only a successful transition to Done.
- Use Taskmaster's amber visual language for a brief, recognizable full-screen moment.
- Keep the workspace operable and preserve keyboard focus while the visual layer is present.
- Announce completion accessibly without forcing assistive-technology users through a modal.
- Teach the boundary between authoritative server state and ephemeral client feedback.

**Non-Goals:**

- Generating personalized encouragement with Gemini.
- Persisting, replaying, queuing, or dismissing celebrations.
- Changing task status rules, ownership filters, Server Action return values, or task ordering.
- Adding sounds, confetti particles, streaks, achievements, or completion history.
- Adding the Module 14 `completedAt` metric field early.

## Decisions

### Gate feedback on the returned database status

`handleToggleComplete` will update local task state exactly as it does today and will start the celebration only when the returned task has status `Done`. A reopen returns `Todo`, and a failed action returns no task, so neither path celebrates. This uses the server result rather than the clicked button label or stale client state.

The alternative is to start the effect immediately on click. That feels faster but can falsely celebrate an unauthorized, missing, or failed mutation.

### Keep ephemeral state in `TaskDashboard`

The dashboard already coordinates lifecycle mutations and owns the page-level render boundary. A small incrementing celebration key can mount or restart the overlay after each successful completion; the overlay removes itself when its animation ends. This avoids database state and avoids a new global provider for a route-local effect.

### Use a non-modal presentation layer

The celebration will be fixed to the viewport, visually centered, and marked `pointer-events: none`. It will not receive focus, change the active element, or require dismissal. A polite atomic status announcement will expose `Task Complete!` to assistive technology without treating the feedback as an urgent alert.

### Define motion in global CSS

Named keyframes and component-oriented classes in `app/globals.css` keep the full animation sequence readable and allow a targeted `prefers-reduced-motion: reduce` override. The standard sequence uses continuous opacity and scale changes rather than repeated on/off flashes. Reduced motion keeps a short opacity-only confirmation with no scale pulse.

The alternative is a long inline list of arbitrary Tailwind animation values in JSX. That would hide timing relationships and make the accessibility override harder to understand.

### Keep the message deterministic

The exact text is `Task Complete!`. No task content is sent to Gemini, no AI quota is consumed, and no provider failure can affect completion feedback. The existing application already demonstrates structured AI where model judgment adds value; this fixed success confirmation does not need it.

### Comment only the trust and accessibility boundaries

Useful comments should explain why celebration starts from the returned status and why the overlay is non-modal. Keyframe percentages, state setters, and ordinary conditional JSX are self-explanatory and should not receive narration comments.

## Risks / Trade-offs

- [Risk] A bright full-screen effect could be uncomfortable or resemble strobing. -> Use one continuous low-intensity amber pulse, avoid rapid alternation, and provide an opacity-only reduced-motion variant.
- [Risk] A visual overlay could block controls or disrupt keyboard users. -> Disable pointer events, never move focus, and remove the layer automatically.
- [Risk] A client-side assumption could celebrate a failed or reopened task. -> Gate the effect only on the successful Server Action result with status `Done`.
- [Risk] Multiple quick completions could leave stale cleanup events. -> Key each mounted celebration and clear only the currently rendered instance at animation completion.
- [Trade-off] Ephemeral feedback disappears on refresh and is not auditable. -> This is intentional because it is presentation feedback, not task data.

## Migration Plan

1. Add success-gated celebration state and overlay markup to the dashboard.
2. Add amber animation and reduced-motion CSS.
3. Update Module 12 documentation and project context.
4. Verify completion, reopen, failure, keyboard, reduced-motion, mobile, and desktop behavior.
5. Run formatting, lint, type checking, production build, strict OpenSpec validation, and whitespace checks.

Rollback removes the transient dashboard state, overlay markup, and animation classes. No data migration or compatibility path is required.

## Open Questions

None. The user selected the warm amber direction and approximately 1.5-second duration; later apply checkpoints will confirm detailed visual and accessibility preferences one question at a time.
