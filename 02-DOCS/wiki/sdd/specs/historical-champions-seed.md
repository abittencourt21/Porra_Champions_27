---
type: spec
title: Spec — Semilla histórica de Champions League
description: Datos históricos trazables de la Champions League 2025-26 para sustituir la semilla ficticia y servir de referencia a la porra 2026-27.
tags: [sdd, spec, champions-league, data]
timestamp: 2026-07-20T00:00:00Z
topic: sdd
slug: historical-champions-seed
status: clarified
---

# Spec — Semilla histórica de Champions League

> Slug: `historical-champions-seed` · Status: clarified · Created: 2026-07-20
> Inherits: no constitution yet

## Problem & why

La aplicación parte de una semilla ficticia correspondiente a otro torneo. Esto impide comprobar de forma realista el formato de la Champions League y no permite verificar de dónde proceden los partidos ni sus resultados. Se necesita una referencia histórica completa y comprobable para preparar la porra de Champions 2026-27.

## Goals

- La semilla representa los partidos y resultados históricos de la UEFA Champions League 2025-26 desde la fase liga hasta la final.
- Cada dato histórico publicado puede rastrearse hasta TheSportsDB y la temporada de referencia indicada por el usuario.
- La experiencia de la porra representa la fase liga y las eliminatorias de la Champions, sin presentar datos ficticios del Mundial.
- Los 36 clubes de la fase liga se agrupan en los cuatro bombos oficiales UEFA de la temporada 2025-26.
- El histórico queda claramente identificado como referencia y no se confunde con el futuro calendario operativo 2026-27.

## Non-goals / out of scope

- Incluir rondas de clasificación previas a la fase liga.
- Publicar o inferir resultados, participantes, calendario o clasificaciones de la temporada 2026-27 que aún no estén disponibles como datos reales.
- Incorporar estadísticas que TheSportsDB no provea de forma verificable, como el pichichi, salvo que se aporte una fuente adicional explícita.
- Cambiar las reglas de la porra más allá de lo indispensable para que el formato Champions sea coherente.

## Users & context

El organizador necesita validar la porra con un torneo real ya finalizado antes de operar la edición 2026-27. Los participantes y visitantes consultan jornadas, eliminatorias, resultados y la procedencia de los datos en la web publicada.

## Behaviour

- Main path: al generar los datos de la porra, se muestra una temporada histórica de referencia de Champions 2025-26 con todos los encuentros de fase liga y de eliminatorias hasta la final, sus fechas, equipos, estado y marcador disponibles.
- Main path: la interfaz distingue visualmente la fase liga de cada ronda eliminatoria y deja de presentar conceptos propios del Mundial que no correspondan a Champions.
- Main path: los datos publicados indican la competición, temporada, fuente y referencia que permiten comprobar su procedencia.
- Edge cases: si la fuente no ofrece un campo necesario o un encuentro de la temporada seleccionada, el dato se conserva como no disponible y se genera un aviso visible; nunca se rellena con un valor inventado.
- Edge cases: los partidos decididos fuera de los 90 minutos reflejan el resultado de partido y el equipo clasificado cuando la fuente lo permita, sin atribuir un marcador a 90 minutos que no esté confirmado.
- Edge cases: cada partido de una eliminatoria a doble encuentro se conserva individualmente; la puntuación mantiene el criterio existente de resultado a 90 minutos y concede el pase una sola vez por ronda y club.
- Error paths: si no puede verificarse la obtención de la temporada, no se sustituye silenciosamente la semilla por datos parciales o de otra competición.

## Acceptance criteria

- Given la semilla histórica generada, When se revisan sus metadatos, Then identifican la UEFA Champions League 2025-26, TheSportsDB como fuente y la referencia de temporada proporcionada.
- Given la lista de partidos histórica, When se filtran sus etapas, Then contiene fase liga y eliminatorias hasta la final, y no contiene partidos de rondas clasificatorias.
- Given un partido incluido, When se consulta su identificador de fuente, Then puede asociarse de forma unívoca al evento histórico correspondiente de TheSportsDB.
- Given la web generada con la semilla histórica, When un visitante abre jornadas y eliminatorias, Then ve denominaciones y etapas de Champions coherentes con los datos publicados, sin referencias visibles al Mundial.
- Given que falte o sea inconsistente un dato de fuente, When se genera la salida, Then el dato no se inventa y se expone una alerta trazable.
- Given que no exista un calendario 2026-27 verificable, When se usa la aplicación, Then el histórico 2025-26 permanece identificado como referencia y no como programación actual.
- Given una eliminatoria de dos encuentros, When se calcula la puntuación, Then cada encuentro conserva su resultado a 90 minutos y el bonus de clasificación se contabiliza una única vez para el club y la ronda.

## Points to clarify

Ninguno para esta entrega. La actualización automática de 2026-27 queda explícitamente fuera de alcance.

## Clarifications

### 2026-07-20 — Bombos de clubes

**Q:** ¿Cómo se asignan los bombos de los clubes para la simulación y puntuación histórica?  
**Decision:** Se usarán los cuatro bombos oficiales UEFA de la fase liga 2025-26.  
**Why:** El usuario lo confirmó expresamente; conserva la trazabilidad y el formato de cuatro elecciones sin inventar categorías.

### 2026-07-20 — Eliminatorias y adaptación mínima

**Q:** ¿Cómo se resuelven eliminatorias a doble partido y cuánto se adapta la porra?  
**Decision:** Se conservan los dos partidos y el resultado a 90 minutos de cada uno; el pase se refleja una vez por ronda. Se adapta solo la estructura, textos y selecciones imprescindibles para representar Champions.  
**Why:** Mantiene el comportamiento de puntuación ya documentado en el proyecto y acota el cambio solicitado a datos reales y formato de competición.
