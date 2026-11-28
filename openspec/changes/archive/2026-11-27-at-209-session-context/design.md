## Context

El adaptador editor puede cambiar durante o después de una solicitud. La respuesta validada para el proyecto anterior no debe permanecer visible en la sesión nueva.

## Decisions

- El adaptador expone `contextVersion` como señal opaca; no contiene token ni datos de usuario.
- El componente invalida resultado y clave de reintento al cambiar la señal y vuelve a consultar el editor.
- Cada solicitud captura la versión y rechaza una continuación tardía si la versión ya cambió. Las comprobaciones de acceso concurrentes se serializan con contador.
- La evidencia de navegador usa un proveedor/transporte solo en copia desechable. La configuración normal queda cerrada.
