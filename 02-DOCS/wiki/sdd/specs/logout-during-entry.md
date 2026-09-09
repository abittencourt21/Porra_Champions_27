---
type: spec
title: Spec - Salida segura durante el alta
slug: logout-during-entry
status: implemented
updated: 2026-09-09
---

# Salida segura durante el alta

## Problema

Una sesión autenticada puede llegar al paso «Define tu porra» sin que la persona sepa qué cuenta está activa. Hoy no hay una forma directa de salir desde ese paso, con riesgo de crear o modificar una inscripción ajena o de pruebas.

## Comportamiento

- Toda pantalla autenticada previa a una inscripción confirmada (elección de alias y «Define/Actualiza tu porra») mostrará un botón secundario «Salir».
- La cuenta activa se muestra por email antes de guardar datos.
- Al pulsarlo se cerrará la sesión de Supabase y se volverá a la pantalla de acceso.
- No se guardará ningún perfil ni inscripción parcial; los cambios no confirmados se descartan.
- La salida ya disponible para un usuario con inscripción se mantiene sin cambios.

## Criterios de aceptación

- Una persona en «Elige tu alias» puede cerrar sesión sin crear un perfil.
- Una persona en «Define tu porra» o «Actualiza tu porra» puede cerrar sesión sin guardar elecciones.
- Tras cerrar sesión, la aplicación no muestra datos privados de la cuenta anterior.
