## ADDED Requirements

### Requirement: Generador canónico por fases exactas
El generador SHALL aceptar solo el artefacto canónico integrado de dos operaciones o el artefacto público revisado de cinco operaciones. En ambas fases SHALL verificar sin deriva los contratos de salud e intake y sus esquemas preexistentes.

#### Scenario: Fase actual
- **GIVEN** el artefacto integrado de dos rutas
- **WHEN** corre el chequeo de contratos
- **THEN** pasa sin cambiar el pin ni el cliente de salud.

#### Scenario: Fase futura revisada
- **GIVEN** el artefacto revisado de cinco rutas en una fixture desechable
- **WHEN** corre el generador
- **THEN** valida explícitamente listado de proyectos, lectura de proyecto y preview autenticado con sus parámetros, seguridad, respuestas y esquemas.

#### Scenario: Drift de contratos
- **GIVEN** una mutación de ruta, esquema, seguridad o bytes en cualquier fase
- **WHEN** corre el generador
- **THEN** falla sin aprobar automáticamente la nueva forma.
