---
type: spec
title: Spec - Autenticación por contraseña, Google y Microsoft
slug: auth-password-social-login
status: clarified
priority: 1
updated: 2026-09-03
---

# Autenticación por contraseña, Google y Microsoft

## Objetivo

Sustituir Magic Link como acceso principal por Google, Microsoft (proveedor
`azure` de Supabase) y email/contraseña, manteniendo GitHub Pages, Supabase
Auth, RLS y la identidad de los participantes.

## Alcance

- Mostrar, en este orden, Google, Microsoft y formulario email/contraseña.
- Permitir crear cuenta, entrar, recuperar contraseña y cerrarla sesión.
- El alta requiere confirmación por email; Brevo queda solo para confirmación y
  recuperación, nunca para un acceso normal con contraseña u OAuth.
- Construir todos los retornos desde la URL desplegada, preservando
  `/Porra_Champions_27/`.
- Tras autenticar, reutilizar el flujo existente: alias, inscripción y zona
  privada. Perfiles, entradas y predicciones conservan sus RLS actuales.

## Reglas y seguridad

- Google usa `signInWithOAuth({ provider: "google" })`; Microsoft usa
  `provider: "azure"`, con `email` cuando sea necesario.
- Email/contraseña usa `signUp`, `signInWithPassword`,
  `resetPasswordForEmail` y `updateUser`; la contraseña debe tener al menos
  ocho caracteres antes de llamar a Supabase.
- No mostrar ni invocar `signInWithOtp` ni el formulario Magic Link.
- Errores de credenciales y recuperación son neutrales; no permiten enumerar
  cuentas. La interfaz usa mensajes inline, carga, botones deshabilitados,
  labels, foco visible y región anunciable; no `alert()` en los nuevos flujos.
- No se guardan secretos OAuth, SMTP ni `service_role` en Git, Pages o JS
  público. La clave publishable y RLS siguen siendo la frontera cliente.
- Si OAuth crea un `auth.users.id` distinto para un participante existente, no
  se fusionan ni copian datos automáticamente: se bloquea el despliegue y se
  resuelve de forma administrativa segura.

## Configuración externa obligatoria

En Supabase: Email + Password, Google y Azure activos; Site URL y Redirect URL
`https://abittencourt21.github.io/Porra_Champions_27/`; SMTP Brevo solo para
confirmaciones y recuperación. En las consolas Google y Microsoft se registra
exactamente el callback que indique Supabase y sus client secrets se guardan
solo allí. Azure debe admitir cuentas personales, no únicamente el tenant del
propietario.

## Aceptación

1. Sin sesión se ven Google, Microsoft y email/contraseña; no Magic Link.
2. OAuth y confirmación/recuperación vuelven al subpath de Pages con sesión.
3. Una contraseña válida inicia sesión sin correo; el alta y la recuperación
   responden de forma segura y comprensible.
4. Recargar conserva sesión, y salir la elimina.
5. Una cuenta Magic Link existente conserva `auth.users.id`, alias,
   inscripción y pronósticos tras la migración validada.
6. Ningún artefacto generado contiene credenciales privadas; las pruebas de
   proyecto y generación de datos terminan correctamente.

## Fuera de alcance

SSO/SAML, MFA, passkeys, backend propio, cambio de Supabase/Brevo, fusión
automática de cuentas, cambios de puntuación o de inscripción.
