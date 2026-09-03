---
type: spec
title: Spec - Selectores buscables de equipos y Pichichi
slug: searchable-team-player-selectors
status: queued
priority: 2
source: spec-selectores-equipos-pichichi-v2.md
---

# Selectores buscables de equipos y Pichichi

Sustituir los selectores nativos de inscripción por combobox accesibles,
ordenados alfabéticamente y buscables sin acentos, puntuación o mayúsculas.
El Pichichi será un jugador activo de un catálogo trazable UEFA en Supabase,
guardando `player_id` y el texto histórico.

Un equipo podrá aparecer como máximo dos veces entre los cuatro bombos,
campeón y subcampeón; Pichichi no cuenta. La regla se validará de forma
inmediata en la UI, antes de enviar y atómicamente en Supabase mediante RPC o
trigger. Los jugadores solo se importarán mediante un proceso administrativo
reproducible, sin consultas deportivas desde Pages.
