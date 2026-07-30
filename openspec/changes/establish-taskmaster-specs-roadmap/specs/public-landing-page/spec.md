## ADDED Requirements

### Requirement: Module 2 public product presentation
The public root route SHALL present Taskmaster's identity, value proposition, primary call to action, and a visual preview in the established responsive visual language.

#### Scenario: Visitor opens the landing page
- **WHEN** any visitor navigates to `/`
- **THEN** the page displays the Taskmaster brand, productivity value proposition, and representative task-planning preview

### Requirement: Session-aware entry controls
The landing page SHALL show sign-in and sign-up controls to signed-out visitors and workspace access plus session controls to signed-in users.

#### Scenario: Signed-out visitor
- **WHEN** Clerk reports no active session
- **THEN** the landing page offers sign-in and sign-up without exposing private task data

#### Scenario: Signed-in visitor
- **WHEN** Clerk reports an active session
- **THEN** the landing page offers navigation to `/tasks` and a user session menu

### Requirement: Responsive landing experience
The landing page SHALL remain usable on mobile and desktop without horizontal overflow or loss of primary actions.

#### Scenario: Narrow viewport
- **WHEN** the landing page is viewed on a mobile-width screen
- **THEN** branding, content, preview, and session controls adapt into a readable single-column experience
