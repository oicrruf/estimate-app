# app-delivery-gates Specification

## Purpose

Hacer reproducibles las comprobaciones de calidad y entrega de la aplicación sin secretos de producción.

## Requirements

### Requirement: Validación reproducible
El repositorio SHALL ofrecer instalación fijada y comandos de build, lint, tipos, tests y OpenSpec ejecutables sin secretos.

#### Scenario: Checkout limpio
- **GIVEN** un checkout limpio y Node compatible
- **WHEN** CI ejecuta la instalación y validación
- **THEN** todos los gates estáticos corren sin credenciales productivas.

### Requirement: Política de PR
CI SHALL comprobar título Conventional Commits con AT-XXX, identidad aprobada del commit y ausencia de trailers discrecionales de coautoría AI, además de escanear secretos de forma defensiva.

#### Scenario: Título inválido
- **GIVEN** un PR sin código AT-XXX en el título
- **WHEN** corre CI
- **THEN** falla el gate de política.

### Requirement: Fases CI visibles con resumen protegido
CI SHALL mostrar Angular quality, Angular tests, contracts, OpenSpec/metadata y production build como trabajos independientes. El contexto protegido `verify` SHALL depender de estas fases y de los trabajos existentes `secrets` y `dependency-review`, ejecutarse después de ellas y aprobar sólo si todas terminan con `success`.

#### Scenario: Todas las fases exitosas
- **GIVEN** que cada fase requerida termina con `success`
- **WHEN** corre el resumen `verify`
- **THEN** el contexto protegido aprueba.

#### Scenario: Fase no exitosa
- **GIVEN** que una fase requerida falla, se omite, se cancela o falta de la lista de dependencias
- **WHEN** corre el resumen `verify`
- **THEN** el contexto protegido falla.
