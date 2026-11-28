## Why

El contrato de preview autenticado ya está integrado, pero la portada no tiene una sesión ni un compositor conectado. Un corte local debe demostrar la transición de revisión pendiente sin fingir autenticación ni alterar la demo guiada.

## What Changes

- Añadir un compositor Angular que solo se monta con un adaptador de sesión/proyecto inyectado y queda desactivado en la aplicación publicada por defecto.
- Validar permiso editorial en cada intento y aceptar únicamente la confirmación tipada del backend.
- Mostrar pregunta, evidencia y límites de un resultado pendiente; manejar errores y reintentos sin duplicar envíos concurrentes.

## Capabilities

- `scope-review-composer`

## Impact

Portada Angular y pruebas locales. Sin cambios de contrato, PIN, rutas de demo, proveedor ni servicios alojados.
