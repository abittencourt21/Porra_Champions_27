---
type: plan
slug: searchable-team-player-selectors
status: approved-autopilot
updated: 2026-09-03
---

# Plan — Selectores y Pichichi

## Hechos verificados

- UEFA exige que cada jugador figure en Lista A o B; Lista A 2026/27 se cerró
  el 2 de septiembre y Lista B puede cambiar durante la temporada.
- Las páginas de plantilla UEFA exponen jugadores por club y posición. El
  catálogo debe registrar URL y captura, y no puede completarse con nombres
  inventados ni con consultas de navegador.

## Secuencia

1. Añadir migración: `players`, `entries.top_scorer_player_id`, políticas de
   lectura de jugadores y RPC `save_entry` que compruebe bombos, campeón/sub
   distinto, máximo dos y jugador activo del equipo participante.
2. Añadir importador administrativo idempotente de un artefacto UEFA auditable;
   conserva históricos como inactivos y sincroniza mediante service key.
3. Crear utilidades puras de normalización, ordenación y conteo, con pruebas.
4. Sustituir el formulario por combobox de equipos y jugador con filtro local,
   estado de opción no disponible y validación inmediata.
5. Cargar `players` una vez por sesión y bloquear solo la confirmación si el
   catálogo no está disponible.
6. Aplicar migración, cargar listas UEFA, validar en móvil/desktop y probar
   payload manipulado antes de abrir inscripciones.

## Riesgo operativo

La publicación de 36 plantillas debe capturarse desde sus URLs UEFA y guardarse
como artefacto versionado; el código no debe declarar completo un catálogo vacío
ni usar SportsDB como fuente de elegibilidad.
