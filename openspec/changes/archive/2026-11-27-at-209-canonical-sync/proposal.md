# Sincronizar el contrato canónico autenticado

## Why

La API #39 está integrada en `develop` con bytes OpenAPI verificados. El app debe avanzar su copia y SHA aprobados de forma coordinada sin conectar todavía autenticación ni interfaz.

## What Changes

Copiar los bytes Git del commit integrado, fijar su SHA exacto, mantener el chequeo de dos fases sobre fixtures independientes y actualizar la guía pública de autoridad. El cliente de salud solo se regenera si cambian sus bytes generados.
