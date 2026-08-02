## MODIFIED Requirements

### Requirement: Ordered remaining roadmap
After completed Module 12, Taskmaster SHALL plan remaining work in this order: 14 progress dashboard, 15 testing/accessibility/security hardening, and 16 deployment/portfolio readiness. Module 13 task notes/resources is intentionally removed and the remaining modules SHALL retain their established numbers.

#### Scenario: Current next module is selected
- **WHEN** the project is ready for its next application change
- **THEN** Module 14 progress dashboard becomes the next proposal target

#### Scenario: Future work continues
- **WHEN** each remaining module completes
- **THEN** the next numbered remaining module is proposed without combining multiple modules into one implementation

### Requirement: Module 14 progress dashboard outcome
The Module 14 proposal SHALL define meaningful completion, overdue, and progress metrics derived from trusted persisted task data.

#### Scenario: Module 14 is proposed
- **WHEN** Module 12 completion encouragement is complete and the removed Module 13 has no outstanding work
- **THEN** the proposal distinguishes useful derived metrics from decorative counters and defines their time boundaries

## REMOVED Requirements

### Requirement: Module 13 notes and resources outcome
**Reason**: The user has no need for notes/resources in their intended Taskmaster workflow, and the unimplemented module would add scope without meaningful product value.

**Migration**: No code or data migration is needed because Module 13 was never proposed or implemented. Module 14 progress dashboard becomes the next proposal target while retaining its existing number.
