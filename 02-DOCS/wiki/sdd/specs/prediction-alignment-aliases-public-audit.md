---
type: spec
title: Spec - Pronósticos alineados, aliases y consulta pública
slug: prediction-alignment-aliases-public-audit
status: implemented
updated: 2026-09-10
---

# Pronósticos alineados, aliases y consulta pública

## Problema

Los escudos y nombres de las tarjetas de pronóstico no están perfectamente alineados en vertical con nombres largos. Además, variantes de nombres de TheSportsDB pueden impedir la actualización de resultados. Por último, no existe una forma transparente de consultar los pronósticos de participantes para comprobar la puntuación del Premio Quinielista.

## Comportamiento

- Cada lado de la tarjeta alinea verticalmente escudo y nombre respecto al marcador; nombres largos conservan hasta dos líneas y el bloque completo permanece centrado.
- Se revisan y añaden aliases de equipos de la temporada 2026/27 que sean necesarios para emparejar la respuesta de TheSportsDB con el catálogo canónico.
- La pestaña Quinielista permite consultar pronósticos confirmados de participantes por jornada.
- Un pronóstico de otra persona solo será visible cuando haya cerrado su plazo de edición (una hora antes del inicio); antes permanece privado.
- Tras el resultado, la consulta muestra el marcador indicado, el resultado oficial y los puntos obtenidos.

## Criterios de aceptación

- A 320 px y escritorio, los escudos se alinean al centro vertical del bloque de nombre sin invadir el marcador.
- Las variantes de nombre identificadas en SportsDB se emparejan con el partido de la semilla correspondiente.
- Un usuario autenticado puede seleccionar jornada y participante, y consultar solo pronósticos ya cerrados de otros participantes.
- Ninguna política RLS permite leer predicciones ajenas aún abiertas.
- Los puntos mostrados coinciden con la escala de Quinielista y excluyen J1.
