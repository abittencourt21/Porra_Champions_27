---
type: plan
title: Plan — Semilla histórica de Champions League
slug: historical-champions-seed
status: draft
---

# Plan — Semilla histórica de Champions League

## 0. Global constraints

- Work only on the isolated feature branch/worktree; do not alter the default branch directly.
- Preserve the existing Python package and static-web delivery model; add no undeclared runtime dependency.
- Source fixtures and metadata must identify TheSportsDB and UEFA references, season and capture time; missing values become alerts, never guesses.
- Keep public output free of participant emails, real names, credentials and secrets.
- Use red → green → refactor with `unittest`; the full test suite and data build are mandatory closing checks.

## 1. Context & constraints

- Implementa la [especificación](../specs/historical-champions-seed.md): histórico 2025-26 desde fase liga hasta final, sin previas.
- TheSportsDB es la fuente de eventos y UEFA es la fuente de los cuatro bombos oficiales; ningún marcador, clasificado o bombo se inventa.
- La semilla debe seguir alimentando la salida estática actual y conservar los controles de privacidad existentes.
- No existe constitución ni configuración SDD; se mantiene el estilo Python + JSON + web estática ya presente y se deja constancia de este riesgo.

## 2. Architecture

```text
[TheSportsDB season events] ─┐
                              ├─> [importador Champions] ─> [semilla histórica]
[UEFA official draw pots] ───┘                                  │
                                                                  v
                                                        [generador existente]
                                                                  │
                                                                  v
                                                         [datos.json + web]
```

- **Importador Champions:** obtiene la temporada identificada, filtra los eventos por etapa incluida, normaliza los campos al contrato interno y conserva identificadores de origen.
- **Catálogo UEFA de bombos:** contiene los 36 clubes y su bombo oficial, junto con URL y fecha de la publicación UEFA que lo acredita.
- **Semilla histórica:** es la referencia reproducible que el generador consume sin depender de una llamada de red durante la visualización.
- **Adaptador de presentación y puntuación:** interpreta fase liga y eliminatorias de Champions, usando los datos publicados en vez de constantes del Mundial.

Decisión principal: se versionará una semilla reproducible junto con sus metadatos de procedencia, en vez de depender de una consulta en vivo para cada build. Así la porra puede auditar y repetir el histórico aunque la API cambie o falle.

## 3. Interfaces & contracts

- `fetch_champions_events(season)` devuelve la respuesta de TheSportsDB para liga 4480 y la temporada solicitada; una respuesta vacía o inválida es un error explícito.
- `build_historical_champions_seed(events, pots)` devuelve una semilla con solo fase liga y eliminatorias, ordenada cronológicamente y con un `matchid` que coincide con el identificador del evento de origen.
- El contrato de cada partido conserva: identificador de fuente, fecha local disponible, equipos, etapa, marcador del encuentro, marcador a 90 minutos cuando sea verificable, clasificado cuando sea verificable y estado.
- Los metadatos de la semilla identifican competición, temporada, URLs de TheSportsDB y UEFA, instante de captura y alertas de validación.
- La web lee los bombos desde los datos generados; ningún listado fijo de clubes o selección nacional decide qué mostrar.
- Las etapas visibles son jornada de fase liga y play-off eliminatorio, octavos, cuartos, semifinales y final. Las reglas de puntuación cuentan resultado a 90 minutos por encuentro y pase una vez por ronda y club.

## 4. Data model & flow

1. Se descarga o carga un fixture de TheSportsDB de la temporada 2025-26.
2. El importador normaliza cada evento y descarta previas según su etapa; asigna una etapa de dominio coherente a los partidos aceptados.
3. El catálogo UEFA añade el bombo de cada club de la fase liga y permite validar que son exactamente 36 clubes en cuatro grupos de nueve.
4. La semilla guarda metadatos de trazabilidad y los partidos normalizados; no incorpora resultados no disponibles.
5. El generador de datos calcula clasificación y vistas a partir de esa semilla. La interfaz muestra competición, temporada y fuente, y usa los bombos y etapas publicados.

Migración: se sustituye la semilla de Mundial y los valores de demostración asociados. No se migran picks reales: las demostraciones se actualizan o eliminan para que ningún participante quede asociado a una selección inexistente.

## 5. Testing strategy

| Criterio | Nivel | Prueba |
| --- | --- | --- |
| Metadatos y trazabilidad | Unitario | Fixture de API + catálogo UEFA produce competición, temporada, URLs e identificadores de origen. |
| Exclusión de previas y etapas | Unitario | Fixture mixto conserva solo fase liga y eliminatorias hasta final. |
| Identidad de evento | Unitario | Cada partido normalizado conserva el identificador de TheSportsDB sin duplicados. |
| Bombos oficiales | Unitario | El catálogo contiene 36 clubes, cuatro bombos de nueve y coincide con la lista UEFA. |
| Puntuación a doble partido | Unitario | Dos encuentros de una ronda suman sus resultados y el bonus de pase aparece una vez. |
| Salida y presentación | Integración | El build genera JSON legible por la web sin textos ni equipos del Mundial en las vistas afectadas. |
| Fallos de fuente | Unitario | Respuesta vacía, evento incompleto o club sin bombo producen alerta/error trazable, nunca valores fabricados. |

## 6. Sequencing & dependencies

1. Definir fixtures, catálogo UEFA y normalización de etapas; validar el contrato sin tocar la web.
2. Añadir el importador reproducible y generar la nueva semilla, con pruebas de trazabilidad y filtrado.
3. Adaptar el dominio de puntuación y generación para jornada de fase liga y play-offs Champions; cubrir doble encuentro.
4. Adaptar la web, reglas visibles y participantes de demostración para consumir datos de clubes y etapas, sin constantes del Mundial.
5. Ejecutar el build, pruebas y comprobaciones de contenido; revisar la salida generada.

Los pasos 1 y 2 son prerrequisitos de 3 y 4. Los cambios de dominio y presentación pueden avanzar después en paralelo conceptualmente, pero se integrarán de forma secuencial en esta rama.

## 7. Risks & open decisions

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| TheSportsDB etiqueta rondas de forma incompleta o distinta | Se incluirían o excluirían eventos incorrectos | Fixture histórico, reglas de filtrado explícitas y fallo/alerta ante etapa desconocida. |
| Los nombres UEFA y TheSportsDB difieren | Un club podría carecer de bombo | Tabla de alias mínima y validación de cobertura 36/36. |
| La API pública cambia o no está disponible | No puede regenerarse la semilla | Versionar fixture/captura y separar la obtención de red del build normal. |
| Lógica del Mundial incrustada en UI y puntuación | Datos correctos pero visualización/puntos incorrectos | Pruebas de integración y búsqueda de referencias residuales en superficies afectadas. |
| Pichichi no está en el alcance de la fuente | Bonus final inexacto | Mantenerlo vacío y visible como no disponible hasta aprobar otra fuente. |

No quedan decisiones de producto abiertas. La futura actualización automática 2026-27 sigue fuera de alcance.

## Tasks

<!-- generated by tasks on 2026-07-20; IDs are stable, do not renumber -->

| ID | [P] | Task | Done-check | Depends-on | Trace |
| --- | --- | --- | --- | --- | --- |
| T001 |  | Add Champions season constants, UEFA pots catalogue, and source fixtures | Targeted catalogue/normalisation tests pass and assert 36 clubs in four pots of nine | — | Spec §Goals; §Acceptance 1–3 |
| T002 |  | Write failing importer tests for filtering and traceability | New importer tests fail before implementation for phase filtering, IDs, and incomplete events | T001 | Spec §Behaviour; §Acceptance 1–3, 5 |
| T003 |  | Implement historical Champions seed importer and generation command | T002 tests pass; generated seed contains only included rounds and source metadata | T002 | Spec §Behaviour; §Acceptance 1–3, 5 |
| T004 |  | Replace the World Cup seed and demonstration data with generated Champions history | Build succeeds and its output has 36 UEFA clubs, 2025-26 metadata, and no World Cup teams | T003 | Spec §Goals; §Acceptance 1, 2, 6 |
| T005 |  | Write failing scoring tests for league phase and two-legged knockout ties | New scoring tests fail before adaptation and cover one pass bonus per club/round | T004 | Spec §Behaviour; §Acceptance 6–7 |
| T006 |  | Adapt match classification and scoring to Champions stages | T005 tests pass and full Python test suite remains green | T005 | Spec §Behaviour; §Acceptance 2, 7 |
| T007 |  | Adapt static web data consumption and Champions labels | Generated page data has no affected World Cup labels; manual local inspection shows league phase and knockouts | T004, T006 | Spec §Goals; §Acceptance 4 |
| T008 |  | Update public-facing rules and operational documentation | Search over affected public/docs surfaces finds no stale World Cup instructions for this application; documented provenance matches seed | T007 | Spec §Goals; §Acceptance 1, 4, 6 |
| T009 |  | Run complete build and regression suite | `python -m unittest discover -s tests` and the documented data build command exit 0 | T001–T008 | Spec §Acceptance 1–7 |

**T003 — Interfaces**

- Consumes: TheSportsDB season payload, official UEFA pot catalogue.
- Produces: reproducible seed with `meta` provenance, `bombos`, participants/demo data, and normalized match list; invalid or incomplete source conditions are explicit.

**T006 — Interfaces**

- Consumes: normalized stages for league matchdays, knockout play-off, R16, QF, SF and final.
- Produces: result points by match at 90 minutes and one qualification bonus per team/round.

**T007 — Interfaces**

- Consumes: generated `datos.json` with clubs, pots and normalized stages.
- Produces: view labels and lists derived from the data contract; no fixed tournament-team matrix.

## Review Workload Forecast

| Dimension | Forecast | Why |
| --- | --- | --- |
| Estimated changed lines | 500–900 | Data importer, seed, Python domain, tests, static UI and documentation change together. |
| Files / areas | 12–20 across data, `src`, `tests`, `public` and docs | Cross-stack data-contract migration. |
| Review risk | High | External-source reliability, historical accuracy and scoring changes. |
| Suggested delivery | ask-on-risk | The change exceeds a small review budget and needs evidence-led review. |
