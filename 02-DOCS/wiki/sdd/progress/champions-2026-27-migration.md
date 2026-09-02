# Progreso - champions-2026-27-migration

## T001/T002 - 2026-08-31

- status: in_progress
- red: `python -m unittest tests.test_champions.ChampionsCatalogTests.test_official_uefa_pots_cover_36_clubs_in_four_pots` falló al exigir la temporada 2026-2027.
- green: el mismo test pasa tras actualizar los bombos oficiales, la temporada y las URLs UEFA.
- files: `src/porra_mundial/champions.py`, `tests/test_champions.py`
- evidence: TheSportsDB devuelve eventos de la temporada 2026-2027, incluidos escudos en los eventos; contiene también rondas de clasificación, por lo que no puede sustituir el calendario UEFA de la fase liga.
- blocker: falta incorporar y validar los 144 partidos de fase liga y completar motor/web.
