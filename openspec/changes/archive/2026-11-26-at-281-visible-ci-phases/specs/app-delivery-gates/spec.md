## ADDED Requirements

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
