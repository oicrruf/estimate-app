## ADDED Requirements

### Requirement: Read-only synthetic scope review preview

The local app SHALL render only validated, versioned, synthetic review data
exported from the pinned integrated API bridge. It SHALL distinguish requested,
proposed and pending lines and visibly identify missing evidence. It SHALL
provide no approval or mutation action.

#### Scenario: Valid local fixture

- **GIVEN** a generated fixture for eight PoE cameras, one uplink and the
  missing-evidence control
- **WHEN** the preview loads the same-origin asset
- **THEN** the app shows the requested and proposed lines, pending quantities,
  independent port findings and a clear review-required notice

#### Scenario: Invalid or unavailable fixture

- **GIVEN** an invalid version, excessive data, or unavailable asset
- **WHEN** the preview tries to load it
- **THEN** the app shows a failure state and does not render unvalidated
  content or offer a mutation action
