## Context

Module 14 currently places a large explanatory workspace heading beside a tall progress panel containing its own module label, title, four nested cards, priority distribution, and historical note. The screenshot shows that these competing blocks dominate the first viewport and separate users from task controls. The user wants a concise command-center identity followed by a horizontal metric bar.

The Taskmaster brand mark already exists as a local inline SVG inside `app/page.tsx`. This refinement should reuse that exact visual rather than introducing a second logo implementation or image asset.

## Goals / Non-Goals

**Goals:**

- Reduce the workspace identity to exact title `Command Center`.
- Place the Taskmaster mark at the right of the same title row.
- Place one compact full-width metric ribbon below the title and above task controls/cards.
- Retain only Active, Overdue, Completed this week, and Daily focus.
- Preserve trusted values, live updates, UTC semantics, accessibility, and narrow-screen readability.
- Teach visual hierarchy, shared brand components, and removal of low-value UI.

**Non-Goals:**

- Changing metric calculations, completion timestamps, Prisma, migrations, task actions, or daily-plan state.
- Adding a new logo, uploading an image, changing Clerk avatar behavior, or removing top navigation.
- Keeping the active-priority visualization in another location.
- Redesigning task cards, forms, daily-plan sidebar, task controls, or completion celebration.
- Starting Module 15 quality hardening.

## Decisions

### Extract one shared Taskmaster mark

Move `TaskmasterMark` from `app/page.tsx` into a shared presentation component with a `className` size hook. The SVG remains decorative (`aria-hidden`) while its parent link supplies an accessible home label where interactive. The landing page passes its current large sizing, and the workspace uses a compact header size.

Copying the SVG would make future brand edits drift between routes. A separate image file would add asset management without improving the existing crisp inline mark.

### Separate identity from metrics

`TaskDashboard` will keep the back link and Clerk user control in the existing top navigation. Beneath it, a full-width flex row will hold `Command Center` on the left and the Taskmaster mark on the right. The old eyebrow and paragraph are removed rather than shortened because they repeat obvious workspace behavior and implementation details.

### Use a single four-cell metric ribbon

`ProgressDashboard` will remove its internal heading, active-priority derivation, priority bars, and unknown-history footnote. Its outer panel becomes a responsive grid with four cells: one row at the wide breakpoint, two columns at intermediate widths, and a stack on narrow screens. Shared borders and background make the cells read as one bar instead of four floating cards.

The alternative two-row dashboard was rejected by the user, as was retaining priority distribution. Metric details remain concise enough to explain UTC boundaries without a separate dashboard header.

### Preserve metric and data behavior exactly

Active, overdue, weekly completion, and daily-focus calculations remain unchanged. The removed unknown-history footnote does not change exclusion behavior; old Done rows with null `completedAt` still do not count. No task, plan, AI, quota, ownership, or persistence code should change.

### Keep comments focused on shared ownership and responsive hierarchy

A concise comment can explain why the brand mark is shared and why the ribbon wraps at defined breakpoints. Individual flex, grid, and typography classes should not receive narration comments.

## Risks / Trade-offs

- [Risk] Four cells become cramped before the wide breakpoint. -> Use one, two, and four-column responsive stages with wrapping detail text.
- [Risk] Removing the UTC header makes boundaries unclear. -> Retain UTC language inside the Overdue and Completed-this-week detail labels.
- [Risk] Removing the historical note hides why old Done tasks are excluded. -> Preserve the canonical trusted-data requirement and README explanation; prioritize a clean operational UI.
- [Risk] Extracting the SVG changes the landing mark appearance. -> Pass the landing page's exact existing size and shadow classes to the shared component.
- [Trade-off] Active priority balance is no longer visible. -> This is an explicit user choice to reduce density and prioritize four actionable metrics.

## Migration Plan

1. Ask one focused apply-time question about whether the compact mark should link to the landing page.
2. Extract and reuse the Taskmaster mark without visual regression on the landing page.
3. Replace workspace identity copy with the compact title row.
4. Convert progress into the four-cell horizontal responsive ribbon and remove priority presentation.
5. Update documentation and manually verify wide/narrow layout and live metrics.
6. Run formatting, lint, type checking, production build, strict OpenSpec validation, and whitespace checks.

Rollback restores the prior heading and progress component markup. No data or schema migration is involved.

## Open Questions

- During apply, should selecting the Taskmaster mark return to the landing page or should the mark remain non-interactive?
