## ADDED Requirements

### Requirement: Sincronización canónica de lectura y preview autenticado
El app SHALL fijar el OpenAPI Git del commit integrado de API #39 y su SHA exacto en el guard canónico. El guard SHALL mantener descendencia y comparación de bytes con el remoto público, mientras las pruebas de dos fases SHALL conservar un artefacto histórico separado.

#### Scenario: Commit integrado sin drift
- **GIVEN** el API `develop` integrado y su blob OpenAPI idéntico al app
- **WHEN** corre el guard canónico
- **THEN** verifica descendencia, bytes y cliente generado sin cambiar rutas visibles.

#### Scenario: Dos fases probadas después del avance
- **GIVEN** fixtures separadas de dos y cinco rutas
- **WHEN** corre la prueba del generador
- **THEN** ambas pasan y mutaciones de seguridad o esquema siguen fallando.
