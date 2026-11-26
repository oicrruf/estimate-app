# AT-278 — vista local de evaluación sintética

## Why

La candidata local necesita una pantalla mínima para mostrar decisiones y evidencia del servicio AT-227. La base Angular actual sólo muestra un espacio vacío.

## What Changes

- Agregar ruta `/demo` en español para consultar un endpoint fijo de sólo lectura.
- Configurar proxy de desarrollo al servicio loopback y tipar/validar la respuesta antes de mostrarla.
- Presentar decisión técnica, rutas de evidencia, inventario y ausencia de oferta, con controles de teclado y errores visibles.
- Probar la interfaz con dobles tipados. La prueba HTTP real queda pendiente del servicio independiente.

## Impact

No cambia OpenAPI canónico, autenticación, A2UI, producción ni la pantalla base. No inventa resultados del backend ni depende de Figma.
