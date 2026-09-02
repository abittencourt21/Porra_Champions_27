---
type: spec
title: Spec - Migración operativa Champions 2026/27
description: Equipos, bombos, calendario, escudos y experiencia de porra para la temporada UEFA Champions League 2026/27.
tags: [sdd, spec, champions, temporada-2026-27]
timestamp: 2026-08-31T14:34:00+02:00
topic: sdd
slug: champions-2026-27-migration
status: clarified
---

# Spec - Migración operativa Champions 2026/27

> Slug: `champions-2026-27-migration` · Status: draft · Actualizada: 2026-08-31
> Inherits: [constitution](../constitution.md)

## Problem & why

La porra publicada sigue mostrando la temporada histórica 2025/26. UEFA ya ha confirmado los 36 participantes, los cuatro bombos y los 144 partidos de la fase liga 2026/27; mantener la temporada anterior impediría a los participantes probar y seguir la porra real de esta edición.

## Goals

- Mostrar los 36 clubes oficiales de la fase liga 2026/27, clasificados en los cuatro bombos oficiales de nueve equipos.
- Permitir identificar visualmente cada club mediante un escudo en miniatura en todos los puestos donde se presente el equipo.
- Presentar las ocho jornadas con su calendario oficial y mantener resultados pendientes como desconocidos hasta que existan.
- Reflejar play-offs, octavos, cuartos, semifinales y final solo cuando sus participantes o partidos estén confirmados, sin conceder puntuación por el play-off.
- Adaptar la experiencia completa de la porra a la nueva temporada y usar la imagen entregada por el usuario como cabecera.
- Permitir inscripción inicial con un club por bombo, campeón, subcampeón y pichichi, y pronósticos confirmados por partido.
- Bloquear cada pronóstico una hora antes del inicio y no conceder puntos a pronósticos no confirmados a tiempo.
- Aplicar puntuación progresiva por fase, desde la fase liga hasta la final.
- Mantener trazabilidad: UEFA determina torneo y TheSportsDB solo complementa escudos y sirve de contraste.

## Non-goals / out of scope

- No incluir rondas clasificatorias ni clubes eliminados antes de la fase liga.
- No inventar marcadores, emparejamientos ni equipos clasificados sin confirmación oficial.
- No convertir TheSportsDB en autoridad frente a UEFA ni bloquear la porra si su cobertura es incompleta.
- No añadir autenticación, pagos ni una nueva administración de participantes.
- No permitir edición de una inscripción tras el comienzo de la primera jornada.

## Users & context

Los participantes eligen un club de cada bombo y consultan partidos, resultados y clasificación durante la Champions League 2026/27. La persona que administra la porra necesita regenerar datos actualizados sin sustituir información oficial por datos incompletos de una fuente secundaria.

## Behaviour

- Main path: al abrir la porra se ve la cabecera proporcionada, los clubes de los cuatro bombos con sus escudos, las ocho jornadas oficiales y la información de su porra para 2026/27.
- Main path: cada aparición de un club en selecciones, calendario, clasificación o eliminatorias muestra su escudo cuando esté disponible y conserva un identificador legible cuando no lo esté.
- Main path: cuando resultados y clasificaciones oficiales determinen la siguiente fase, la porra expone sus participantes y partidos; antes de ello comunica que está pendiente sin simular cruces.
- Main path: la clasificación general aplica los mismos criterios de desempate que UEFA y la puntuación por progreso concede bonus a los ocho primeros de la fase liga y a los ocho equipos que alcanzan octavos desde los puestos 9–24.
- Main path: una persona confirma su inscripción inicial antes de la primera jornada y confirma cada pronóstico antes de su límite individual; los pronósticos no confirmados se muestran como perdidos y puntúan cero.
- Edge cases: datos secundarios que no coincidan con UEFA se señalan para revisión y no reemplazan el dato oficial; un escudo ausente no oculta el nombre ni invalida la página.
- Error paths: si la fuente secundaria no ofrece partidos de esta temporada o devuelve cobertura parcial, se conserva el calendario oficial y no se publican resultados ficticios.

## Acceptance criteria

- Given la temporada 2026/27 publicada por UEFA, When se generan los datos de la porra, Then contiene exactamente 36 clubes repartidos en cuatro bombos de nueve y cada club pertenece a un único bombo.
- Given el calendario oficial de la fase liga, When se consulta la temporada, Then se muestran 144 partidos distribuidos entre ocho jornadas y ningún resultado pendiente aparece como jugado.
- Given un club mostrado en cualquier puesto relevante, When hay un escudo disponible, Then el puesto presenta su escudo en miniatura junto a su nombre; When no lo hay, Then el nombre sigue visible y no se muestra un enlace roto.
- Given que aún no existen clasificados oficiales para una fase eliminatoria, When se abre esa fase, Then no se muestran equipos ni cruces inventados.
- Given que se confirmen oficialmente participantes o partidos de una fase eliminatoria, When se actualicen los datos, Then la fase aparece con los datos confirmados y puede contribuir a la vista de puntuación.
- Given la página principal de la porra, When se abre la temporada 2026/27, Then utiliza la imagen de sorteo proporcionada como cabecera.
- Given datos de UEFA y TheSportsDB que discrepen, When se genera o revisa la temporada, Then se conserva el dato UEFA y queda evidencia del conflicto.
- Given la clasificación final de la fase liga, When se ordenan dos o más equipos, Then el orden y los desempates coinciden con los criterios UEFA aplicables.
- Given un equipo que disputa el play-off de acceso a octavos, When juega esa eliminatoria, Then sus resultados de equipo no reciben bonus de progreso; estos se conceden solo al quedar entre los ocho primeros o al acceder a octavos desde los puestos 9–24.
- Given una predicción de fase liga, When acierta el marcador exacto, Then suma 3 puntos; When solo acierta 1X2, Then suma 1 punto; When falla, Then suma 0 puntos.
- Given una predicción confirmada en fase liga o play-off, When acierta exacto o 1X2, Then suma 3/1 puntos; Given una predicción en octavos, cuartos, semifinal o final, Then suma respectivamente 6/2, 8/3, 10/4 o 12/5 puntos.
- Given un partido cuya hora de inicio está a menos de una hora, When una persona intenta confirmar o modificar su pronóstico, Then la operación se rechaza y el pronóstico no confirmado puntúa cero.

## Points to clarify

- No quedan decisiones bloqueantes. Los escudos se consumen como enriquecimiento opcional de TheSportsDB; sin respuesta válida se muestra solo el nombre.

## Clarifications

- 2026-09-01 — Retroalimentación de puntuación: al finalizar un partido, el indicador de puntos diferencia visualmente marcador exacto, 1X2 acertado y fallo.
- 2026-09-02 — Reglas y play-off: las reglas se condensan en una lectura de columna única; el play-off de acceso a octavos puntúa 3/1 en quiniela, como la fase liga, pero no concede bonus de progreso de equipos.
- 2026-09-01 — Lectura de resultados: cada jornada muestra una leyenda compacta de puntuación (exacto y 1X2); los partidos finalizados exponen resultado oficial a 90 minutos y los puntos logrados.

- 2026-09-01 — Usabilidad de pronósticos: se puede generar un marcador aleatorio por partido o para todos los partidos abiertos; los valores generados no se confirman hasta un guardado explícito.
- 2026-08-31 — Persistencia y privacidad: Supabase Free gestiona acceso por enlace mágico. Cada perfil, inscripción y pronóstico queda limitado por RLS a `auth.uid()`; la publicación solo expone datos agregados autorizados.
- 2026-08-31 — Bonus del play-off: no puntúa. Se concede bonus solo a los ocho primeros de la fase liga y a los ocho equipos que acceden a octavos desde los puestos 9–24.
- 2026-08-31 — Clasificación general: se aplican los criterios UEFA vigentes de ordenación y desempate.
- 2026-08-31 — Fases futuras: solo se muestran participantes y cruces confirmados oficialmente.
- 2026-08-31 — Cuantía del bonus: equivale al número de bombo y se aplica una sola vez al entrar entre los ocho primeros o al acceder a octavos desde los puestos 9–24.
- 2026-08-31 — Predicciones y puntuación: inscripción inicial cerrada al comenzar la jornada uno; predicciones bloqueadas una hora antes del partido. La escala por resultado es 3/1 en fase liga, 4/1 play-off, 6/2 octavos, 8/3 cuartos, 10/4 semifinal y 12/5 final.
- 2026-08-31 — Eliminatorias: cada partido de ida o vuelta se predice y puntúa individualmente con su resultado a 90 minutos; el bonus de avance es independiente.

## Historial de esta especificación

- 2026-07-20: la especificación original preparaba una migración sin equipos, bombos ni calendario confirmados.
- 2026-08-31: se amplía a la migración operativa tras la publicación oficial UEFA y la aprobación del enfoque UEFA primario + TheSportsDB secundario.

## Fuentes verificadas

- [Bombos oficiales UEFA 2026/27](https://www.uefa.com/uefachampionsleague/news/02a8-21717d0c6cb5-03a9a5ff1552-1000--champions-league-league-phase-draw-pots-confirmed/).
- [Calendario oficial UEFA de la fase liga 2026/27](https://www.uefa.com/uefachampionsleague/news/02a8-2174c9e9019d-f909a77bd77a-1000--2026-27-champions-league-all-the-league-phase-fixtures/).
- [Documentación de TheSportsDB](https://www.thesportsdb.com/documentation).
