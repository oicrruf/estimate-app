# api-contract-client Specification

## Purpose

Mantener tipado el contrato de salud exportado por el API y detectar divergencia entre repositorios.

## Requirements

### Requirement: Contrato de salud congelado
El cliente SHALL representar solo OpenAPI 3.1, versión `0.1.0`, `GET /health`, `operationId: health` y respuesta HTTP 200 JSON `{status: "ok"}`.

#### Scenario: Respuesta válida
- **GIVEN** una respuesta HTTP 200 con `status` igual a `ok`
- **WHEN** el cliente consulta salud
- **THEN** devuelve un resultado tipado exitoso.

#### Scenario: Respuesta inesperada
- **GIVEN** una respuesta inválida o HTTP no exitoso
- **WHEN** el cliente consulta salud
- **THEN** comunica error sin tratarla como salud válida.

### Requirement: Drift verificable
El repositorio SHALL detectar cambios entre el OpenAPI versionado del API canónico, la referencia versionada del app y el cliente generado. El gate SHALL consultar sólo `develop` del remoto canónico fijo, exigir descendencia del último commit aprobado y comparar bytes de blobs Git sin ejecutar código del checkout del API.

#### Scenario: Export diferente
- **GIVEN** un export API con cambio en el contrato
- **WHEN** corre el gate de contratos
- **THEN** falla hasta actualizar referencia y cliente en una revisión coordinada.

#### Scenario: Descendiente con contrato idéntico
- **GIVEN** que `develop` desciende el commit API aprobado y mantiene idéntico `contracts/openapi.json`
- **WHEN** corre el gate de contratos
- **THEN** acepta el cambio de HEAD y verifica la referencia y cliente generados del app.

#### Scenario: Contrato modificado
- **GIVEN** que `develop` desciende el commit API aprobado pero modifica el blob OpenAPI
- **WHEN** corre el gate de contratos
- **THEN** falla hasta una actualización coordinada del contrato.

#### Scenario: Referencia divergente
- **GIVEN** que el commit consultado no desciende el commit API aprobado aunque su blob sea idéntico
- **WHEN** corre el gate de contratos
- **THEN** falla por procedencia no aprobada.

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
