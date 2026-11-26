## MODIFIED Requirements

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
