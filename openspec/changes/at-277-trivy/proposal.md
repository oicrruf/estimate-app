# AT-277 — Gate defensivo Trivy para app

## Why

La CI actual revisa dependencias y secretos, pero no escanea configuraciones y el contenedor de entrega construido a partir del bundle.

## What Changes

Agregar check aislado de Trivy para filesystem e imagen de vista previa construida en CI. Bloquear HIGH/CRITICAL y secretos; resumir MEDIUM. No cambiar despliegue ni reglas de protección.

## Fuera de alcance

La imagen de vista previa no define el hosting final. No acceder a hosts, registros privados, datos reales ni servicios de notificación. SARIF y excepciones requieren decisión posterior del propietario.
