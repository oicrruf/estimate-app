# app-bootstrap Specification

## Purpose

Proveer una base Angular accesible y responsive con un límite seguro para trabajo A2UI futuro.

## Requirements

### Requirement: Shell responsive
La app SHALL compilar un shell Angular accesible que se adapte a pantallas angostas sin depender de servicios externos.

#### Scenario: Pantalla móvil
- **GIVEN** una ventana estrecha
- **WHEN** se muestra la página inicial
- **THEN** el contenido permanece legible y no genera desplazamiento horizontal.

### Requirement: Límite A2UI
La app SHALL reservar un límite tipado A2UI sin interpretar mensajes externos durante AT-207.

#### Scenario: Sin mensajes
- **GIVEN** que no hay mensajes A2UI
- **WHEN** se renderiza el área de trabajo
- **THEN** se muestra un estado vacío seguro.
