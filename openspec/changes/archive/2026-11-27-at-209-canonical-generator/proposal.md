# Preparar el generador canónico para el contrato autenticado

## Why

El generador actual reconoce las dos operaciones integradas. La API revisada en PR #39 agrega tres operaciones autenticadas; el app necesita comprobarlas sin adelantar el pin real antes del merge.

## What Changes

Comprobar bytes exactos, contratos de salud/intake congelados y formas explícitas de las tres operaciones nuevas en ambos estados admitidos. Agregar pruebas negativas de drift y ensayo de cinco operaciones en una fixture Git desechable. Mantener la interfaz y el gate canónico reales sin conexión nueva.
