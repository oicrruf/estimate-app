## ADDED Requirements

### Requirement: Isolated draft intake preview client
The app SHALL generate a separate typed client from the exact reviewed public intake preview OpenAPI artifact. The ordinary contract check SHALL verify its fixture and generated output without changing the approved canonical health reference or lineage gate. The client SHALL not be wired to a route before coordinated integration.

#### Scenario: Reviewed preview artifact
- **GIVEN** the pinned public preview fixture and generated client
- **WHEN** the ordinary contract check runs
- **THEN** the preview check passes after the unchanged canonical checks.

#### Scenario: Fixture or generated output drift
- **GIVEN** changed preview bytes or a stale generated client
- **WHEN** the ordinary contract check runs
- **THEN** it fails without advancing the canonical pin.

#### Scenario: Optional undefined fields
- **GIVEN** a request with recognized optional `undefined` fields at nested object levels
- **WHEN** the client validates and serializes it
- **THEN** only those fields are omitted while missing required fields and unknown keys still fail.

#### Scenario: Unicode bound and unsafe response
- **GIVEN** a description with supplementary Unicode characters or a response claiming persistence
- **WHEN** the client validates it
- **THEN** it counts code points for the schema length bound and rejects any non-pending or persisted response.
