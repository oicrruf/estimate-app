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
