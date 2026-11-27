## Context

El adaptador señala cambios de cuenta/proyecto mediante `contextVersion`. El efecto Angular que lo observa puede ejecutarse después de un evento submit ya en cola.

## Decisions

- Guardar la última versión aceptada y compararla de forma síncrona en edición, acceso y envío.
- Al detectar una versión nueva, borrar brief, resultado y clave, bloquear envío y reevaluar editor; el efecto posterior no debe reactivar datos viejos.
- Una respuesta tardía solo puede presentarse si revisión local y versión de contexto siguen coincidiendo.
- Ante editor ausente o HTTP 401/403/404, borrar el brief y bloquear otro envío hasta revalidar acceso.
