## ADDED Requirements

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
