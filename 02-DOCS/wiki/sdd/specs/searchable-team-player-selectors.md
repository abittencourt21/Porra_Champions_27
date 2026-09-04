---
type: spec
title: Spec - Selectores buscables de equipos y Pichichi
slug: searchable-team-player-selectors
status: approved-autopilot
priority: 2
source: spec-selectores-equipos-pichichi-v2.md
---

# Selectores buscables de equipos y Pichichi

## Mejora UX 2026-09-04

- La inscripción explicará junto al formulario la regla de diversidad: no se
  admiten combinaciones que coincidan en tres o más de los cuatro equipos de
  bombos con una inscripción anterior; se conserva la primera confirmada.
- Una inscripción ya guardada se podrá abrir y modificar hasta el inicio del
  primer partido de fase liga. Al cerrarse, el control desaparece y la API
  mantiene el mismo límite de seguridad.

Sustituir los selectores nativos de inscripción por combobox accesibles,
ordenados alfabéticamente y buscables sin acentos, puntuación o mayúsculas.
El Pichichi será un jugador activo de un catálogo trazable UEFA en Supabase,
guardando `player_id` y el texto histórico.

Un equipo podrá aparecer como máximo dos veces entre los cuatro bombos,
campeón y subcampeón; Pichichi no cuenta. La regla se validará de forma
inmediata en la UI, antes de enviar y atómicamente en Supabase mediante RPC o
trigger. Los jugadores solo se importarán mediante un proceso administrativo
reproducible, sin consultas deportivas desde Pages.
