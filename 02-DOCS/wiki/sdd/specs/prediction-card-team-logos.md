---
type: spec
title: Spec - Tarjetas de pronóstico con escudos
slug: prediction-card-team-logos
status: implemented
updated: 2026-09-09
---

# Tarjetas de pronóstico con escudos

## Problema

En pantallas estrechas, los nombres de equipos visitantes compiten con el marcador, el estado y los controles, llegando a solaparse.

## Comportamiento

- La línea principal muestra escudo local, nombre local, marcador centrado, nombre visitante y escudo visitante.
- Fecha/jornada, estado y acciones pasan a una segunda línea independiente.
- Los escudos usan el catálogo existente, miden 20–22 px en móvil y degradan al nombre si faltan.
- Los nombres pueden ocupar hasta dos líneas, sin desplazar ni tapar el marcador.
- En escritorio se conserva la cuadrícula de tres tarjetas por fila.

## Criterios de aceptación

- No hay solape entre nombres, marcador, estado ni acciones a 320 px de ancho.
- El marcador permanece centrado y los controles siguen accesibles por teclado y táctil.
- Un escudo ausente no genera imagen rota ni oculta el nombre del equipo.
