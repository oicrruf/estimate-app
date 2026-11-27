## Why

La verificación local reveló que un resultado de preview podía quedar visible después de cambiar de cuenta o proyecto sin un nuevo envío.

## What Changes

- Exigir al adaptador una revisión opaca de contexto que cambie cuando cambian cuenta o proyecto.
- Borrar resultados y clave de reintento al cambiar el contexto; rechazar respuestas tardías del contexto anterior.
- Probar la portada real y la variante sintética en navegador sin llamadas externas.

## Capabilities

- `scope-review-composer`

## Impact

Solo adaptador local, pruebas y guía. Sin proveedor real, contrato API o despliegue.
