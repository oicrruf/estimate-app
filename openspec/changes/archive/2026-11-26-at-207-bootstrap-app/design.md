## Context

ADR 0001 de `estimate-api` define Angular/A2UI como cliente de FastAPI y Supabase como plataforma futura de datos e identidad. La rama API AT-207 proveerá el OpenAPI canónico. Para coordinar repos independientes se congela inicialmente únicamente `GET /health`.

## Goals / Non-Goals

**Goals:** app estática compilable; contrato de salud tipado; comprobación del archivo generado contra un OpenAPI de referencia; guía y CI que contrasten el export canónico actual en una revisión coordinada.

**Non-Goals:** endpoints de dominio, Auth, RLS, Storage, escritura de Supabase, despliegue, diseño final, localización completa, implementación de mensajes A2UI.

## Decisions

### Angular y límite A2UI

Se usa Angular standalone con TypeScript estricto. `a2ui/` expone una interfaz local pequeña para una futura fuente de mensajes y un componente de estado vacío; no interpreta ni ejecuta contenido remoto. El shell es accesible y se adapta a pantallas angostas. No se presenta una falsa sesión o datos de proyecto.

### Contrato cruzado

La fuente canónica vive en `estimate-api` y exporta JSON OpenAPI 3.1 ordenado de forma determinista. Este repo guarda una referencia de esa exportación y un cliente TypeScript generado. `contract:check` compara el cliente regenerado con el archivo versionado y valida que el contrato tenga exactamente la ruta de salud acordada. CI del app descarga el commit inmutable backend AT-207, verifica su export contra el código FastAPI y compara por bytes el artefacto canónico con la referencia del app. El PR documenta la dependencia del PR backend y su SHA; al fusionar el backend se fija `develop` para el gate permanente. No se agregan rutas de dominio especulativas.

### Gates y riesgos

CI valida instalación limpia, build, lint, tipos, tests, OpenSpec, políticas de título/identidad y escaneo defensivo de secretos. La configuración efectiva de protecciones de rama requiere autoridad del coordinador y queda como propuesta documentada. Las validaciones estáticas no requieren credenciales productivas. Un cambio del export API obliga a actualizar referencia y cliente en la misma revisión.

## Testing

Test positivo y negativo del cliente (`ok` y respuesta inválida/error), drift positivo y negativo, OpenSpec estricto y build. Se usa solo una respuesta sintética de salud.
