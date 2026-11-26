# AT-278 — vista local sintética

La ruta `http://127.0.0.1:4200/demo` muestra una evaluación de solo lectura. Los datos, inventario, ofertas y evidencia son ficticios. Es un panel acotado; no incluye shell de proyecto, A2UI completo, autenticación, cotización ni despliegue.

Después de `npm ci`, el único comando del frontend es:

```sh
npm run demo:local
```

Angular reenvía sólo `/v1/demo` al servicio local `http://127.0.0.1:8000` mediante `proxy.conf.json`. El navegador solicita por mismo origen `GET /v1/demo/evaluate` con `scenario=switch|camera|ups` y únicamente `poe_ports_min=8|12` para switch o `quantity=2|4` para cámara. UPS no añade opción. No se usan claves ni URL alojadas. El proxy existe únicamente durante `ng serve`; un build estático por sí solo no conecta a un backend.

## Plan de prueba

1. Ejecutar `npm ci && npm run check` en este repo. Las pruebas de interfaz usan dobles tipados; verifican URL y método GET, switch 8→12, cámara 2/4, UPS sin oferta, rutas, respuesta inválida, texto no interpretado como HTML y error sin resultado fabricado.
2. Cuando el servicio HTTP independiente de AT-278 esté disponible, arrancarlo en `127.0.0.1:8000` con el store sintético AT-227/AT-229 sembrado y reabierto. El motor base integrado en `estimate-api/develop` es `9f745b92bbfd2ee987471164a2e97c1ee2a87206`; el endpoint HTTP todavía no forma parte de ese SHA. No sustituir esta etapa por respuestas simuladas.
3. Abrir `/demo` con el servidor Angular de arriba. Confirmar en la pestaña de red que todas las consultas salen a `/v1/demo/evaluate` por el mismo origen, sin credenciales ni escrituras.
4. Switch: con ocho PoE, observar SW-8 incompatible por puertos totales y SW-16 elegible; subir a doce y observar SW-16 incompatible por PoE. Abrir rutas de capacidad y evidencia.
5. Cámara: pedir dos y luego cuatro; observar que el pool compartido permite dos y bloquea cuatro aunque existan ofertas listadas. UPS: observar compatibilidad técnica sin oferta ni producto seleccionado.
6. Detener el servicio y repetir: la vista debe mostrar error y retirar el resultado previo. Probar teclado, etiquetas de controles y pantalla estrecha. Registrar SHA de ambos repos y respuesta HTTP real antes de declarar integrada la candidata.

Esta entrega cubre sólo el frontend. La prueba HTTP con Relate real sigue pendiente del servicio separado. No se afirma que la UI haya superado esa prueba ni que exista publicación productiva.
