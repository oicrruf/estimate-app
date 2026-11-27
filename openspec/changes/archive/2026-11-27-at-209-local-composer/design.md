## Context

La portada actual muestra un workspace vacío. El cliente `previewScopeReview` exige proyecto, token, idempotencia y transporte; no hay sesión real en la app.

## Decisions

- Un `InjectionToken` sin proveedor predeterminado define el adaptador habilitado. La portada conserva su estado vacío si falta.
- El adaptador suministra el contexto desde una futura sesión confiable; el formulario nunca lee rol, proyecto ni token del DOM. El contexto se obtiene otra vez antes de cada envío.
- El cliente existente verifica que la respuesta coincida con el proyecto y siga pendiente/no persistida. Los fallos de autorización ocultan la respuesta previa y bloquean nuevos envíos hasta revalidar una sesión.
- La clave de idempotencia se conserva al reintentar el mismo texto y se renueva al editarlo.
- Las pruebas inyectan transporte y sesión sintéticos. La portada normal no instala el adaptador.

## Risks

El tipado no prueba autorización real. Antes de habilitar la ruta, un adaptador de autenticación debe obtener sesión y permiso editorial verificables, y el backend debe confirmar membresía en cada solicitud.
