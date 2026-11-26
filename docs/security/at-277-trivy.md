# AT-277 — Escaneo defensivo app (borrador)

## Alcance

El workflow [AT-277](../../.github/workflows/at-277-trivy.yml) analiza el código fuente y una imagen Nginx de **vista previa** construida con el bundle Angular. Esa imagen no representa todavía un despliegue real. La [documentación de Trivy para repositorios](https://trivy.dev/docs/latest/target/repository/) describe los detectores y su [guía de resultados](https://trivy.dev/docs/latest/configuration/reporting/) documenta JSON y SARIF.

Trivy 0.76.2 se obtiene de `docker.io/aquasec/trivy:0.76.2@sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb`. La procedencia de esa imagen se verificó con dos firmas Cosign del publicador oficial durante la preparación de AT-277. El escaneo solicita vulnerabilidades, configuraciones y secretos, con todas las severidades. Bloquea HIGH, CRITICAL, UNKNOWN y cualquier secreto. MEDIUM se informa. Fallos de construcción, DB, Trivy o parseo fallan cerrado. No hay excepciones ni ignore activo.

La configuración e ignore vacíos se crean fuera del checkout. El parser publica solo un JSON de estado y recuentos por superficie, sin rutas, contenido ni identificadores; el artifact dura siete días. El workflow usa `contents: read`, sin SARIF, cron, notificaciones, `pull_request_target`, privilegios adicionales ni cambios de reglas. El build Angular ocurre en otro job; el scanner recibe un bundle de corta retención y usa un checkout nuevo. Sigue siendo posible que un PR cambie el propio `scan.sh` que evalúa el check: este resultado **no constituye un gate confiable** hasta ejecutar política e invocación ancladas a una revisión protegida independiente. El P2 de la revisión de seguridad continúa abierto.

## Integración con bases actuales

La preparación se hizo sobre app `develop` `d24ca275ce15758ebd687d26f2e87eb5c174798a` y API `develop` `f0f612eaacbc1f1ea59d463b3ee4ff5234dcfc1b`, que incluyen AT-281. AT-280 es dueño del check canónico: esta rama no modifica `.github/workflows/ci.yml`, `scripts/check-canonical-api.mjs`, `scripts/canonical-api-test.mjs`, `docs/contract-sync.md` ni `package.json`. El check AT-280 lee el Git del API canónico y compara la descendencia y los bytes del contrato sin ejecutar código de aquel repositorio en el runner de app. No debe reemplazarse por el flujo anterior de AT-277 que construía o importaba código API. La fase agregada `verify` y las fases AT-281 quedan intactas.

La rama predeterminada de ambos repositorios es ahora `develop`; `main` sigue siendo rama de release protegida. Por tanto, un eventual workflow confiable con despacho manual se promovería a `develop` mediante revisión autorizada. Un ensayo externo y puntual escaneó el SHA del PR anterior con Trivy real y encontró 0 HIGH/CRITICAL/UNKNOWN y 0 secretos en fuente, pero no sustituye un check obligatorio. La imagen final no pudo comprobarse independientemente en ese runner porque Alpine no confió en el certificado TLS del repositorio; no se desactivó TLS. El workflow de GitHub del head reconciliado tendrá que volver a probarse. La decisión sobre anclar el verificador o exigir un contexto de status corresponde al propietario después de demostrarlo; no se cambian reglas durante este borrador.

## Límite de producto

La imagen Nginx está fijada a `nginx:1.31.9-alpine3.24@sha256:fb4658584bd9a916ffb6f6e365f97c25cfdb2923801f551ea08356e695f14ff7`, actualiza `libxml2`, usa puerto 8080 y usuario no root. Un contenedor de despliegue futuro debe escanearse cuando exista. La ausencia de HIGH en un escaneo del checkout no prueba la ausencia de fallos en ese contenedor.
