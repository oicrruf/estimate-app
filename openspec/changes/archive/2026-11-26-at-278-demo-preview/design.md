# Diseño

La ruta `/demo` es un componente independiente. El componente raíz conserva la pantalla base en `/` y aloja el router. Un servicio HTTP llama a `/v1/demo/evaluate` con `scenario` obligatorio y sólo el parámetro pertinente (`poe_ports_min` para switch, `quantity` para cámara). UPS no añade parámetros. El proxy Angular de desarrollo reenvía `/v1/demo` a `http://127.0.0.1:8001` por defecto; `AT278_PREVIEW_PORT` permite otro puerto local si está ocupado.

El lector de respuesta acepta el contrato de AT-227 (`scenario`, `selectedProductId`, `candidates`, `productId`, `status`, `reasonCodes`, `evidencePaths`) y limita la cantidad y tamaño de texto mostrado. Angular interpola texto, sin HTML dinámico. Una respuesta inválida o fallo HTTP muestra error sin candidato falso. Los tests usan dobles tipados y `HttpTestingController`; no sustituyen el smoke HTTP con Relate real.
