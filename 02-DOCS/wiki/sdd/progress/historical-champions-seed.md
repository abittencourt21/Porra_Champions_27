# Implementation progress — Historical Champions seed

## T001 — 2026-07-20

- status: complete
- red: `tests.test_champions` failed because `porra_mundial.champions` did not exist (after repairing a pre-existing dataclass field-order import error exposed by Python 3.12).
- green: `tests.test_champions` passed with 36 clubs split into four official UEFA pots.
- triangulation: asserts both a pot-one and a pot-four club plus 9 clubs per pot.
- files: `src/porra_mundial/models.py`, `src/porra_mundial/champions.py`, `tests/test_champions.py`
- decision: UEFA source URLs are constants alongside the official pot catalogue; fixture/result parsing remains the next task.
- blocker: none

## T002–T007 — 2026-07-20

- status: complete
- red: la prueba del parser no encontraba una función de importación; la prueba con fechas eliminatorias sin año excluía ese partido; la prueba de jornada `J01` no existía.
- green: el parser UEFA extrae 189 encuentros (144 fase liga y 45 eliminatorias), normaliza los clubes contra los bombos oficiales y preserva el ID/URL UEFA de cada evento.
- triangulation: se verifican las cuatro rondas de bombos, los IDs UEFA, exclusión de previas, fechas sin año y puntuación de jornada Champions.
- files: `src/porra_mundial/champions.py`, `src/porra_mundial/models.py`, `src/porra_mundial/scoring.py`, `public/app.js`, `data/seed.json`, `public/datos.json`, tests relacionados.
- decision: UEFA es la fuente primaria; TheSportsDB queda referenciada como contraste secundario debido a la cobertura limitada del tier gratuito.
- blocker: none

## T008 — 2026-07-20

- status: complete
- verification: la UI usa clubes, bombos oficiales y ocho jornadas de fase liga; ya no muestra países anfitriones, grupos del Mundial ni fechas de inscripción inventadas.
- documentation: README y reglas describen la semilla histórica UEFA 2025/26, la fuente secundaria TheSportsDB y las reglas aplicables al MVP.
- automation: el workflow elimina la configuración específica del Mundial y conserva una ejecución diaria de Pages.
- decision: las fechas, formulario y pagos de 2026/27 se mantienen pendientes de una convocatoria explícita; no se deducen del histórico.
- blocker: none
