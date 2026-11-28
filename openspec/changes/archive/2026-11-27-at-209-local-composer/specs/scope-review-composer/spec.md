## ADDED Requirements

### Requirement: Compositor local cerrado por defecto
La app SHALL mantener el compositor de preview ausente y sin solicitudes HTTP cuando no exista un adaptador confiable de sesión y proyecto. SHALL evitar ID fijo, token estático o rol introducido por la interfaz.

#### Scenario: Portada normal
- **GIVEN** la configuración pública sin adaptador
- **WHEN** se abre la portada
- **THEN** conserva el espacio vacío y no envía solicitudes de preview.

#### Scenario: Sin editor autenticado
- **GIVEN** un adaptador habilitado sin contexto editorial válido
- **WHEN** se intenta evaluar
- **THEN** el compositor no envía solicitudes y muestra una limitación de acceso.

### Requirement: Resultado pendiente confirmado
El compositor SHALL mostrar únicamente respuestas validadas como pendientes, no persistidas y sin preparación comercial. SHALL mostrar una pregunta no vacía, IDs de evidencia y cantidad de inventario solo si el contrato la proporciona.

#### Scenario: Resultado sintético válido
- **GIVEN** editor sintético, transporte inyectado y respuesta pendiente válida
- **WHEN** se envía un brief
- **THEN** muestra pregunta y evidencia como texto, sin afirmar aprobación ni compra.

### Requirement: Fallos y reintentos seguros
El compositor SHALL impedir envíos concurrentes, borrar resultados anteriores ante errores y conservar la misma clave de idempotencia para reintentar el mismo texto. SHALL tratar 404 sin revelar si el proyecto existe o si la membresía fue revocada.

#### Scenario: Cuota y reintento
- **GIVEN** una respuesta 429 para el primer intento
- **WHEN** se reintenta el mismo texto
- **THEN** se reutiliza la clave y solo se muestra un resultado si el backend confirma una respuesta válida.

#### Scenario: Autorización perdida
- **GIVEN** una respuesta 401, 403 o 404
- **WHEN** falla la solicitud
- **THEN** se borra la vista anterior y se bloquea un nuevo envío hasta revalidar el contexto.
