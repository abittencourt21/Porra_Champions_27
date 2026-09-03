---
type: analysis
slug: auth-password-social-login
status: passed
updated: 2026-09-03
---

# Análisis de consistencia — autenticación

## Hallazgos

- `public/app.js` usa `signInWithOtp` y un único formulario
  `data-magic-link-form`; es el único flujo de acceso activo.
- La sesión se obtiene por `getUser()` y se actualiza por
  `onAuthStateChange()`. `loadPrivateData()` usa RLS correctamente para
  `profiles`, `entries` y `predictions`, por lo que no debe cambiarse.
- El redirect actual (`window.location.origin + window.location.pathname`)
  conserva el subpath de Pages y debe encapsularse para reutilizarlo en OAuth,
  alta y recuperación.
- El proyecto no dispone de tests JavaScript/DOM. Se pueden añadir pruebas
  puras de adaptadores de URL, validación de contraseña y mapeo de errores con
  `node --test`, sin introducir un framework.

## Riesgos y decisión

| Riesgo | Tratamiento |
| --- | --- |
| OAuth crea un usuario distinto | Prueba manual previa con una cuenta existente; no migración automática. |
| Callback incorrecto | Documentar URL exacta y usar un único constructor de redirect. |
| Doble envío/render | Estado de solicitud por acción y listener de sesión único. |
| Enumeración de cuentas | Respuestas neutras para alta y recuperación; error genérico al entrar. |
| Secretos en Pages | Solo URL + publishable key se generan en Actions; OAuth/SMTP/service key quedan fuera. |

## Gate

La arquitectura propuesta es compatible con Supabase JS v2, GitHub Pages y las
políticas RLS existentes. El único requisito no automatizable es configurar y
probar los proveedores en Supabase/Google/Microsoft; no bloquea el desarrollo
ni autoriza a suplantar identidades existentes.
