# Diseño AT-277 app

Un job sin credenciales persistidas construye el bundle Angular con `npm ci` y `npm run build`; otro job obtiene el bundle de corta retención y hace checkout fresco para construir una imagen Nginx fijada por digest solo para scan. Exporta la imagen a tar temporal. El ejecutable Trivy oficial 0.76.2 se extrae de una imagen fijada por digest y verificada con Cosign; analiza el checkout y el tar sin socket Docker ni secretos. La DB se comparte entre los dos scans del job, sin persistir caché entre PR; el JSON queda temporal y no se sube.

El parser Python común de esta rama bloquea HIGH/CRITICAL y cualquier secreto; cuenta MEDIUM, y falla ante JSON inválido o severidad desconocida. No hay excepciones activas. El workflow añade un contexto nuevo; no toca los checks existentes ni reglas de protección.

La remediación reemplaza la base Nginx antigua por una publicación mantenida y actualiza `libxml2` a la versión con parche publicado. La vista previa usa puerto no privilegiado, configuración explícita y usuario no root. El parser deduplica por destino, paquete, versión, ID y posición, conserva la severidad más estricta de duplicados sin depender del orden, rechaza identidades malformadas y etiqueta fuente e imagen por separado. La imagen final debe confirmar el resultado en CI; no se dispensa un hallazgo residual.

AT-280 conserva la verificación del API canónico sin ejecutar su código en el runner de app; AT-277 no modifica esa ruta. Este workflow todavía ejecuta la invocación y política de Trivy desde el PR, por lo que el P2 de confianza impide considerarlo gate exigible. La rama predeterminada ahora es `develop`; anclar la lógica a una revisión protegida de esa rama y luego cambiar reglas requiere decisión separada del propietario.
