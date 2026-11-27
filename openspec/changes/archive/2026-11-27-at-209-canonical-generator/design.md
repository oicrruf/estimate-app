# Design

El generador acepta exclusivamente el hash de la referencia canónica actual de dos rutas o el hash público revisado de cinco rutas. Una proyección estable compara exactamente las rutas health/intake y sus dieciocho esquemas previos en ambas fases. Para la fase de cinco rutas comprueba método, `operationId`, seguridad Bearer, parámetros, refs, estados HTTP y esquemas de listado, lectura y preview de proyecto.

La prueba ordinaria ejecuta el generador desde directorios temporales con cada fixture y deriva casos negativos mediante mutaciones sintéticas. El guard de linaje sigue apuntando al remoto público y al SHA integrado actual. El futuro pin solo se usa en el ensayo Git desechable.
