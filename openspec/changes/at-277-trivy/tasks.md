# Tareas AT-277 app

- [x] Definir contrato y política de severidades.
- [x] Fijar y verificar versión/digest del escáner.
- [x] Probar parser con fixtures sintéticas y fallos.
- [x] Construir bundle e imagen de vista previa; escanear fuente e imagen.
- [x] Validar OpenSpec y pruebas locales; documentar hallazgos pendientes del check nuevo.
- [x] Sustituir la base de vista previa, configurar usuario no root y probar sintaxis Nginx.
- [x] Cubrir deduplicación y códigos distintos para fallo de política y de parser.

- [x] Publicar resumen JSON depurado y de retención breve, con prueba sintética.
- [x] Fijar configuración/secretos fuera del checkout y probar HIGH sintético con Trivy real.

- [x] Separar build y scan en jobs con checkout fresco y bundle de corta retención.
- [ ] Ejecutar invocación y política desde una revisión protegida independiente del PR; verificar el contexto antes de exigirlo como check.
- [ ] Repetir CI y escaneo de la imagen final con el head reconciliado.
