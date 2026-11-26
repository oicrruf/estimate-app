# Estimate App

Frontend Angular de Estimate Agent. La ruta principal muestra un espacio de trabajo inicial, adaptable y accesible, todavía sin proyectos ni datos conectados. El límite A2UI presente usa una fuente vacía; no hay asistente conversacional, autenticación ni flujo de cotización para usuarios. La arquitectura está descrita en el [ADR 0001 del API](https://github.com/oicrruf/estimate-api/blob/develop/docs/adr/0001-arquitectura-inicial.md).

## Desarrollo local

Usa Node 24.15.0 (o una versión compatible de Node 24) y npm 11.19.1. Desde la raíz del repositorio:

```sh
npm ci
npm start
```

`npm start` inicia el servidor de desarrollo Angular. Abre la URL local que indique el comando para ver la portada. No necesitas una cuenta ni claves para esa vista. No guardes secretos de runtime ni claves privilegiadas en este repositorio público.

La ruta `/demo` es una **prueba local con datos ficticios**, integrada para evaluar la interfaz con un servicio API local. No es una funcionalidad publicada ni funciona como demo conectado en un build estático por sí solo. Los pasos, el proxy local y los límites están en la [guía de la vista sintética](docs/at-278-local-preview.md); sus SHA y resultados de prueba describen snapshots históricos.

## Contrato con el API

`estimate-api` mantiene el OpenAPI canónico. Este repositorio conserva una copia en [`contracts/openapi.json`](contracts/openapi.json) y genera el cliente tipado en [`src/app/api/health.generated.ts`](src/app/api/health.generated.ts). El contrato integrado aquí cubre únicamente `GET /health`; no implica endpoints de proyectos o cotizaciones.

El [check canónico](scripts/check-canonical-api.mjs) consulta `estimate-api/develop`, comprueba que descienda del commit aprobado fijado en ese script y compara los bytes del OpenAPI actual con los del commit aprobado y la copia de esta app. También comprueba el cliente generado. **No exige que `develop` permanezca en el SHA fijado:** un descendiente con contrato idéntico pasa; un cambio de contrato requiere revisión y actualización coordinada. La CI del API verifica por separado que su artifact corresponda al export de FastAPI. Sigue el [procedimiento de sincronización](docs/contract-sync.md) cuando el contrato cambie; el README no duplica el SHA, que puede avanzar.

## Verificación y contribución

```sh
npm run check
```

El comando ejecuta lint, tipos, pruebas unitarias, pruebas del contrato y de políticas, validación estricta de OpenSpec y build. La [guía de fases de CI](docs/ci-phases.md) indica qué comprueba cada job y cómo `verify` reúne sus resultados. La CI también ejecuta el check canónico vivo, el escaneo de secretos y la revisión de dependencias. Estas comprobaciones no despliegan la app.

Para cambios de comportamiento, sigue OpenSpec: propuesta, especificación y diseño, tareas, implementación, verificación y archivo. Consulta [AGENTS.md](AGENTS.md) y la [plantilla de PR](.github/pull_request_template.md). Cada PR debe actualizar este README o una guía enlazada cuando cambie el comportamiento visible, los comandos, la configuración, el contrato, las pruebas o el despliegue; si no aplica, explica el motivo en el PR. El README es la entrada y las guías conservan el detalle.
