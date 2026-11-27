# Design

El SHA `a2b8d9795b73c2e91a1c54029789fd85bbd76fb5` es el commit integrado de API `develop`; su `contracts/openapi.json` coincide con la fixture pública revisada por SHA-256 `0f13af69dfac409072b66a3d75e940c9bc7ea9970ac5788c0fbf1cc1edd8bcf9`. El app copia ese blob, actualiza `APPROVED_SHA` y mantiene el remoto fijo y el gate de descendencia y bytes. La prueba por fases usa la fixture histórica de dos rutas y la fixture revisada de cinco rutas para seguir probando ambas.

No se conecta la ruta a la UI, no se crea un proveedor y no se prueba Auth o DB alojados.
