# security-scan-gate Specification

## Purpose

Detectar vulnerabilidades, configuraciones riesgosas y secretos antes de integrar cambios, sin publicar material sensible.

## ADDED Requirements

### Requirement: Cobertura de fuente e imagen
La CI SHALL escanear el filesystem del commit y una imagen de vista previa construida desde el bundle de ese commit con Trivy fijado por digest.

#### Scenario: PR de app
- **GIVEN** un PR hacia `develop`
- **WHEN** corre el check AT-277
- **THEN** analiza fuente e imagen exportada y conserva el JSON completo solo en almacenamiento temporal del job y publica un resumen reducido de recuentos y estado.

### Requirement: Gate de severidad
El check SHALL fallar ante vulnerabilidades o configuraciones HIGH/CRITICAL y ante cualquier secreto detectado; SHALL informar recuentos MEDIUM sin imprimir fragmentos de hallazgos.

#### Scenario: Hallazgo sintético HIGH
- **GIVEN** un JSON Trivy sintético con una vulnerabilidad HIGH
- **WHEN** el parser aplica la política
- **THEN** el check termina distinto de cero y emite solo identificador y recuento.

#### Scenario: Hallazgo sintético MEDIUM
- **GIVEN** un JSON Trivy sintético con un hallazgo MEDIUM
- **WHEN** el parser aplica la política
- **THEN** el check informa el recuento y no falla por esa severidad.

### Requirement: Fallo cerrado y privacidad
La CI SHALL fallar cuando Trivy, su DB o el parser fallen; SHALL evitar secretos, JSON bruto y SARIF en logs y artifacts públicos.

#### Scenario: Resultado inválido
- **GIVEN** salida JSON ausente o mal formada
- **WHEN** se evalúa
- **THEN** el check falla sin imprimir la salida bruta.

### Requirement: Resultado de máquina sin datos sensibles
La CI SHALL publicar un artifact JSON de corta retención con recuentos por superficie y estado del gate, sin rutas, IDs de hallazgos, fragmentos ni reporte bruto.

#### Scenario: Reporte inválido
- **GIVEN** que falla el escáner o su salida
- **WHEN** termina el job
- **THEN** el artifact, si pudo inicializarse, conserva `tool_error` y el check falla.
