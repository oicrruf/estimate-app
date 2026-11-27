## Why

La revisión de seguridad del PR #13 detectó que un cambio de cuenta o proyecto borraba resultado y reintento, pero dejaba el brief anterior visible y listo para enviarse con el permiso nuevo.

## What Changes

- Borrar el brief ante cambios de contexto y denegaciones de acceso.
- Invalidar de forma síncrona los eventos de edición o envío que llegan antes de que se ejecute el efecto reactivo.
- Exigir un texto nuevo en el contexto siguiente y comprobarlo con pruebas sintéticas y navegador local.

## Capabilities

- `scope-review-composer`

## Impact

Compositor local desactivado por defecto, pruebas y guía inglesa. Sin conexión a auth, API alojada o despliegue.
