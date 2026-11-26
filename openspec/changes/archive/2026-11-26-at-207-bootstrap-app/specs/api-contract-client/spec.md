## ADDED Requirements

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
El repositorio SHALL detectar cambios entre el export canónico del API, la referencia versionada y el cliente generado.

#### Scenario: Export diferente
- **GIVEN** un export API con cambio en el contrato
- **WHEN** corre el gate de contratos
- **THEN** falla hasta actualizar referencia y cliente en una revisión coordinada.
