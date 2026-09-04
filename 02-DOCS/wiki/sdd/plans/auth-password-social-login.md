---
type: plan
title: Plan - Autenticación por contraseña y Google
slug: auth-password-social-login
status: approved-autopilot
updated: 2026-09-03
---

# Plan de autenticación

## Diseño

1. Extraer en `public/auth.js` funciones puras para URL canónica, contraseña y
   mensajes seguros; probarlas con `node --test`.
2. Sustituir el formulario Magic Link de `public/app.js` por un componente de
   acceso con OAuth, modo entrar/crear y recuperación/restablecimiento.
3. Encapsular llamadas Supabase en funciones nombradas, mantener un solo
   `onAuthStateChange`, y reutilizar el flujo privado actual sin tocar RLS.
4. Añadir estilos responsivos y accesibles para estados inline y contraseña.
5. Documentar la configuración de proveedores, callback y prueba de
   continuidad de una cuenta existente.

## Tareas

| ID | Tarea | Evidencia |
| --- | --- | --- |
| T001 | Pruebas rojas de redirect, contraseña y errores | `node --test` falla antes de implementar |
| T002 | Adaptadores puros de autenticación | T001 verde |
| T003 | Interfaz y flujos Google/Azure/email/recuperación | No queda Magic Link activo |
| T004 | Estilos, accesibilidad y prevención de doble envío | Revisión desktop/móvil |
| T005 | Documentación de Supabase/Google/Microsoft y decisión | README y decisiones actualizados |
| T006 | Regresión | unittest, node tests, build de datos y revisión de secretos verdes |
