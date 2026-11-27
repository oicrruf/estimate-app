## ADDED Requirements

### Requirement: Cantidad opcional en propuesta de preview
El cliente SHALL aceptar `availableQuantity` omitido, nulo o entero no negativo cuando `status` sea válido, conforme a la fixture revisada. SHALL rechazar valores inválidos y propiedades no reconocidas.

#### Scenario: Campo omitido
- **GIVEN** una respuesta pendiente válida con `proposal: {status: "needs_review"}`
- **WHEN** el cliente la valida
- **THEN** devuelve la propuesta sin inventar una cantidad.

#### Scenario: Campo presente válido
- **GIVEN** `availableQuantity` nulo o entero no negativo
- **WHEN** el cliente valida la propuesta
- **THEN** acepta el valor recibido.

#### Scenario: Campo presente inválido
- **GIVEN** cantidad negativa, fraccionaria, cadena, indefinida o una propiedad no reconocida
- **WHEN** el cliente valida la propuesta
- **THEN** rechaza la respuesta.
