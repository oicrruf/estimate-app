## MODIFIED Requirements

### Requirement: Compositor local cerrado por defecto
La app SHALL mantener el compositor de preview ausente y sin solicitudes HTTP cuando no exista un adaptador confiable de sesión y proyecto. SHALL evitar ID fijo, token estático o rol introducido por la interfaz. El adaptador SHALL señalar cambios de cuenta o proyecto con una versión opaca; el compositor SHALL borrar resultados y reintentos anteriores y descartar respuestas tardías del contexto previo.

#### Scenario: Portada normal
- **GIVEN** la configuración pública sin adaptador
- **WHEN** se abre la portada
- **THEN** conserva el espacio vacío y no envía solicitudes de preview.

#### Scenario: Sin editor autenticado
- **GIVEN** un adaptador habilitado sin contexto editorial válido
- **WHEN** se intenta evaluar
- **THEN** el compositor no envía solicitudes y muestra una limitación de acceso.

#### Scenario: Cambio de proyecto o cuenta
- **GIVEN** un resultado pendiente para un contexto editorial
- **WHEN** el adaptador cambia la versión de contexto
- **THEN** desaparece el resultado anterior y una respuesta tardía no puede volver a mostrarlo.
