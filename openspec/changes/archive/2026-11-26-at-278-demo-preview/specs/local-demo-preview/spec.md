# local-demo-preview Specification

## Purpose

Mostrar el resultado sintético de AT-227 mediante una vista local, limitada y de sólo lectura.

## ADDED Requirements

### Requirement: Solicitud acotada
La vista SHALL consultar por mismo origen `GET /v1/demo/evaluate` y SHALL enviar únicamente el escenario y la opción pertinente. El proxy de desarrollo SHALL apuntar al loopback local.

#### Scenario: Switch y cámara
- **GIVEN** la ruta local de demostración
- **WHEN** se elige switch con PoE 12 o cámara con cantidad 2
- **THEN** la solicitud contiene respectivamente `poe_ports_min=12` o `quantity=2`, sin el parámetro del otro escenario.

### Requirement: Decisión explicable
La vista SHALL mostrar selección, candidatos, estados, motivos y rutas de evidencia de la respuesta real, distinguiendo incompatibilidad, inventario insuficiente y compatibilidad técnica sin oferta. SHALL identificar datos ficticios y lectura sin cambios.

#### Scenario: Inventario y UPS
- **GIVEN** respuestas sintéticas de cámara con 2/4 unidades y UPS compatible sin oferta
- **WHEN** se presentan los resultados
- **THEN** se ve la diferencia entre disponibilidad y elegibilidad, y UPS no aparece como producto adquirido.

### Requirement: Errores y accesibilidad
La vista SHALL usar controles etiquetados y operables con teclado, limitar texto y cantidad de rutas, y SHALL mostrar errores de red o contrato sin fabricar datos.

#### Scenario: Servicio ausente
- **GIVEN** un servicio HTTP no disponible
- **WHEN** se solicita evaluación
- **THEN** se muestra un error anunciado y no se muestra un resultado previo como vigente.
