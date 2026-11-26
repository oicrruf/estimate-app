# AT-278 — vista local sintética

La ruta `http://127.0.0.1:4200/demo` muestra una evaluación de solo lectura. Los datos, inventario, ofertas y evidencia son ficticios. Es un panel acotado; no incluye shell de proyecto, A2UI completo, autenticación, cotización ni despliegue.

Después de `npm ci`, el único comando del frontend es:

```sh
npm run demo:local
```

Angular reenvía sólo `/v1/demo` al servicio local `http://127.0.0.1:8001` mediante `proxy.conf.cjs`. El navegador solicita por mismo origen `GET /v1/demo/evaluate` con `scenario=switch|camera|ups` y únicamente `poe_ports_min=8|12` para switch o `quantity=2|4` para cámara. UPS no añade opción. No se usan claves ni URL alojadas. El proxy existe únicamente durante `ng serve`; un build estático por sí solo no conecta a un backend. Si 8001 está ocupado, arranca el API en otro puerto local y usa `AT278_PREVIEW_PORT=<puerto> npm run demo:local`.

## Plan de prueba

1. Ejecutar `npm ci && npm run check` en este repo. Las pruebas de interfaz usan dobles tipados; verifican URL y método GET, switch 8→12, cámara 2/4, UPS sin oferta, rutas, respuesta inválida, texto no interpretado como HTML y error sin resultado fabricado.
2. En un checkout de `estimate-api` de la rama draft AT-278, SHA `11681c7884c3c9658c4b8d549e1da317eb8d44f0`, sembrar un store sintético nuevo con `uv run --frozen --extra demo python -m demo.agent.cli seed --store /tmp/estimate-at278.rl`. Arrancar el servicio con `uv run --frozen --extra demo python -m demo.preview_api --store /tmp/estimate-at278.rl --port 8001`. El servidor reabre el store y sólo consulta; ver `demo/PREVIEW_HTTP.md` del backend.
3. Abrir `/demo` con el servidor Angular de arriba. Confirmar en la pestaña de red que todas las consultas salen a `/v1/demo/evaluate` por el mismo origen, sin credenciales ni escrituras.
4. Switch: con ocho PoE, observar SW-8 incompatible por puertos totales y SW-16 elegible; subir a doce y observar SW-16 incompatible por PoE. Abrir rutas de capacidad y evidencia.
5. Cámara: pedir dos y luego cuatro; observar que el pool compartido permite dos y bloquea cuatro aunque existan ofertas listadas. UPS: observar compatibilidad técnica sin oferta ni producto seleccionado.
6. Detener el servicio y repetir: la vista debe mostrar error y retirar el resultado previo. Probar teclado, etiquetas de controles y pantalla estrecha. Registrar SHA de ambos repos y respuesta HTTP real antes de declarar integrada la candidata.

## Resultado local observado

Con el frontend en `7722bb9f6b416c637da1acf8d3fd21a3ed919e16` más la corrección de puerto de este cambio y el backend draft `11681c7884c3c9658c4b8d549e1da317eb8d44f0`, se sembró un store nuevo en `/tmp/at278-smoke.rl` (60 nodos, 61 relaciones) y se reabrió desde el proceso HTTP. En este entorno, 8001 lo ocupa `cloud-agent-mcp-gateway`, por lo que la prueba usó `--port 8002` y `AT278_PREVIEW_PORT=8002`; ninguna URL alojada ni dato de proyecto intervino.

Chromium mediante Playwright consultó las cinco opciones por el mismo origen `127.0.0.1:4200`, todas con GET: switch 8 eligió SW-16 y mostró rutas; switch 12 no eligió producto; cámara 2 eligió CAM-POE; cámara 4 mostró inventario insuficiente; UPS mostró compatibilidad técnica sin oferta. Una consulta inválida (`ups&quantity=2`) devolvió 422. Tras detener el backend, la vista mostró error y cero candidatos. Esta prueba demuestra la candidata local con esos dos snapshots draft; no implica integración en `develop` ni despliegue.
