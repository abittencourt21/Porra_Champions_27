---
type: spec
title: Spec — Preparación de migración Champions 2026/27
slug: champions-2026-27-migration
status: clarified
---

# Preparación de migración Champions 2026/27

## Problema

La aplicación opera con una semilla histórica UEFA 2025/26. UEFA ha anunciado
las fechas de 2026/27, pero el 20 de julio de 2026 no ha publicado todavía los
36 clubes, bombos ni el calendario de fase liga; el sorteo está previsto para
el 27 de agosto. La transición no puede depender de copiar o inferir datos.

## Objetivo

Dejar un procedimiento repetible que prepare, valide y active una nueva semilla
solo cuando se aporten las dos publicaciones UEFA oficiales: bombos y
calendario/resultados. TheSportsDB seguirá siendo contraste secundario.

## Comportamiento

- El repositorio contiene un manifiesto de temporada explícito con URLs, estado
  y fecha de captura; sin URLs oficiales no se puede activar la temporada.
- El importador acepta archivos HTML capturados de UEFA, una temporada y un
  manifiesto; valida 36 clubes en cuatro bombos de nueve y 144 partidos de las
  ocho jornadas antes de escribir una semilla operativa.
- Los resultados ausentes se conservan como `null`, con estado de calendario;
  nunca se fabrican marcadores o clubes clasificados.
- La activación de `data/seed.json` es un paso separado y explícito. Hasta
  entonces permanece la referencia 2025/26 publicada.

## Criterios de aceptación

- Una plantilla 2026/27 enumera las URLs que faltan y la fecha de sorteo UEFA.
- El comando de preparación rechaza una temporada sin URLs o con HTML
  incompleto, sin sobrescribir la semilla activa.
- Con una captura válida, el resultado se escribe en una ruta de salida elegida
  y conserva las URLs/captura para auditoría.
- README y reglas distinguen la referencia histórica del próximo calendario.

## Fuentes verificadas

- [Calendario europeo UEFA 2026](https://www.uefa.com/news-media/news/02a0-1f71bdf70a9a-b6067bd647f2-1000--2026-european-football-calendar-match-and-draw-dates-for-all/): sorteo de fase liga el 27 de agosto de 2026.
- [Vista UEFA 2026/27](https://www.uefa.com/uefachampionsleague/news/02a6-20d57cfcd03e-407c22a7f465-1000--2026-27-champions-league-teams-dates-draws-format-final/): ocho jornadas, de septiembre de 2026 a enero de 2027.
