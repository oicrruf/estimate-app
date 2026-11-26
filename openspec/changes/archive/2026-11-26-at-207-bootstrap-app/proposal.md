## Why

AT-207 requiere un frontend Angular reproducible y un contrato tipado verificable entre repositorios antes de implementar funcionalidades de dominio. El repositorio app solo contiene el README inicial.

## What Changes

- Crear base Angular con shell responsive mínimo y límite explícito para futuros componentes A2UI.
- Versionar el contrato OpenAPI 3.1 de salud exportado por `estimate-api`, el cliente TypeScript generado y una comprobación determinista de drift.
- Incorporar validaciones locales y CI de build, lint, tipos, tests, OpenSpec, título de PR, escaneo defensivo de secretos y dependencias.
- Documentar flujo Git, setup y verificación cruzada contra el API vivo.

## Capabilities

### New Capabilities
- `app-bootstrap`: shell Angular y límite A2UI sin rutas de dominio.
- `api-contract-client`: cliente tipado del contrato congelado de salud y detección de drift.
- `app-delivery-gates`: comprobaciones reproducibles para la rama de integración.

## Impact

Solo cambia `estimate-app`. No se escriben datos de Supabase ni se configura producción, GitHub settings o secretos. La revisión de diseño detallado y la experiencia bilingüe completa quedan para sus issues posteriores.
