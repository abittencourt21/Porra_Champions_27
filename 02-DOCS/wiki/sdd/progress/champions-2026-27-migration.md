# Progreso - champions-2026-27-migration

## T008 - 2026-09-07

- status: completed
- scope: J1 es jornada de cortesía para la quiniela y el Premio Quinielista; los puntos de equipos y la clasificación general continúan computándose desde J1. Las altas cierran al inicio de J2.
- evidence: validación de sintaxis de `public/app.js`, 60 pruebas Python y regeneración de `public/datos.json` correctas.

## T001/T002 - 2026-08-31

- status: in_progress
- red: `python -m unittest tests.test_champions.ChampionsCatalogTests.test_official_uefa_pots_cover_36_clubs_in_four_pots` falló al exigir la temporada 2026-2027.
- green: el mismo test pasa tras actualizar los bombos oficiales, la temporada y las URLs UEFA.
- files: `src/porra_champions/champions.py`, `tests/test_champions.py`
- evidence: TheSportsDB devuelve eventos de la temporada 2026-2027, incluidos escudos en los eventos; contiene también rondas de clasificación, por lo que no puede sustituir el calendario UEFA de la fase liga.
- blocker: falta incorporar y validar los 144 partidos de fase liga y completar motor/web.
