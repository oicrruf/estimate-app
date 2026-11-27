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

### Requirement: Aislamiento del borrador de revisión de alcance autenticada
La app SHALL mantener el OpenAPI de PR #39 como fixture separado y verificar sus bytes SHA-256, ruta, autorización Bearer, clave de idempotencia y referencias de esquemas. El gate canónico SHALL conservar su SHA y artefacto actuales hasta una integración coordinada.

#### Scenario: Fixture revisada
- **GIVEN** la fixture pública exacta de PR #39
- **WHEN** corre el chequeo de contratos ordinario
- **THEN** valida su procedencia y el contrato sin alterar el gate canónico.

#### Scenario: Drift de fixture
- **GIVEN** bytes o estructura diferentes de la revisión
- **WHEN** corre el chequeo de contratos
- **THEN** falla antes de tratar el borrador como contrato aprobado.

### Requirement: Cliente tipado sin conexión predeterminada
El cliente SHALL exigir permiso tipado de editor de proyecto autenticado, idempotencia y transporte inyectado. La interfaz actual SHALL permanecer sin llamada de red a esta ruta hasta integrar autenticación real y el API canónico.

#### Scenario: Solicitud sintética válida
- **GIVEN** permiso explícito y un transporte HTTP simulado
- **WHEN** se envía un brief válido
- **THEN** adjunta Bearer e idempotencia, omite credenciales de navegador y valida una respuesta pendiente sin persistencia ni aprobación comercial.

#### Scenario: Datos o respuesta inseguros
- **GIVEN** entrada inválida, respuesta con propiedades heredadas o estado comercial/persistido
- **WHEN** el cliente valida
- **THEN** rechaza los datos y no presenta un resultado aceptado.

#### Scenario: Recurso oculto o fallas de servicio
- **GIVEN** HTTP 401, 403, 404, 409, 422, 429, 503 o una falla de red
- **WHEN** la solicitud simulada falla
- **THEN** devuelve solo un código acotado; 404 no distingue proyecto inexistente de membresía revocada.

### Requirement: Generador canónico por fases exactas
El generador SHALL aceptar solo el artefacto canónico integrado de dos operaciones o el artefacto público revisado de cinco operaciones. En ambas fases SHALL verificar sin deriva los contratos de salud e intake y sus esquemas preexistentes.

#### Scenario: Fase actual
- **GIVEN** el artefacto integrado de dos rutas
- **WHEN** corre el chequeo de contratos
- **THEN** pasa sin cambiar el pin ni el cliente de salud.

#### Scenario: Fase futura revisada
- **GIVEN** el artefacto revisado de cinco rutas en una fixture desechable
- **WHEN** corre el generador
- **THEN** valida explícitamente listado de proyectos, lectura de proyecto y preview autenticado con sus parámetros, seguridad, respuestas y esquemas.

#### Scenario: Drift de contratos
- **GIVEN** una mutación de ruta, esquema, seguridad o bytes en cualquier fase
- **WHEN** corre el generador
- **THEN** falla sin aprobar automáticamente la nueva forma.

### Requirement: Cantidad opcional en propuesta de preview
El cliente SHALL aceptar `availableQuantity` omitido, nulo o entero no negativo cuando `status` sea válido, conforme a la fixture revisada. SHALL rechazar valores inválidos y propiedades no reconocidas.

#### Scenario: Campo omitido
- **GIVEN** una respuesta pendiente válida con `proposal: {status: "needs_review"}`
- **WHEN** el cliente la valida
- **THEN** devuelve la propuesta sin inventar una cantidad.

#### Scenario: Campo presente válido
- **GIVEN** `availableQuantity` nulo o entero no negativo
- **WHEN** el cliente valida la propuesta
- **THEN** acepta el valor recibido.

#### Scenario: Campo presente inválido
- **GIVEN** cantidad negativa, fraccionaria, cadena, indefinida o una propiedad no reconocida
- **WHEN** el cliente valida la propuesta
- **THEN** rechaza la respuesta.

### Requirement: Sincronización canónica de lectura y preview autenticado
El app SHALL fijar el OpenAPI Git del commit integrado de API #39 y su SHA exacto en el guard canónico. El guard SHALL mantener descendencia y comparación de bytes con el remoto público, mientras las pruebas de dos fases SHALL conservar un artefacto histórico separado.

#### Scenario: Commit integrado sin drift
- **GIVEN** el API `develop` integrado y su blob OpenAPI idéntico al app
- **WHEN** corre el guard canónico
- **THEN** verifica descendencia, bytes y cliente generado sin cambiar rutas visibles.

#### Scenario: Dos fases probadas después del avance
- **GIVEN** fixtures separadas de dos y cinco rutas
- **WHEN** corre la prueba del generador
- **THEN** ambas pasan y mutaciones de seguridad o esquema siguen fallando.
