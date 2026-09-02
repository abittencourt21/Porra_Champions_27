---
type: plan
title: Plan - Migración operativa Champions 2026/27
slug: champions-2026-27-migration
status: approved-autopilot
updated: 2026-08-31
---

# Plan - Migración operativa Champions 2026/27

## 0. Restricciones globales

- Mantener Python, web estática, JSON publicado y `unittest`.
- Los datos UEFA tienen prioridad; cualquier dato de TheSportsDB es enriquecimiento o contraste.
- No publicar secretos ni datos personales. La fuente secundaria puede fallar sin impedir generar la temporada.
- Aplicar TDD y ejecutar la suite completa y el generador antes de entregar.

## Arquitectura y datos

0. Sustituir el almacenamiento local de usuarios por Supabase Free: Auth con Magic Link, perfiles, inscripción y pronósticos privados protegidos con RLS; el cierre se refuerza en un RPC que consulta la hora canónica del partido.
1. Sustituir la semilla histórica por una semilla 2026/27 trazable con los 36 clubes, cuatro bombos, las 144 citas oficiales y metadatos de fuente/captura. Los partidos futuros conservan marcadores nulos.
2. Extender el contrato publicado con un catálogo de equipos: nombre canónico, bombo, país y URL de escudo opcional. Toda la web resuelve el mismo catálogo en vez de mantener nombres, banderas o imágenes por separado.
3. Separar la fase liga (`J01`–`J08`) del play-off de acceso a octavos y de las rondas puntuables. El motor calcula los criterios UEFA de tabla y materializa la fase siguiente solo cuando haya entradas confirmadas.
4. Mantener una capa de actualización: UEFA aporta el calendario de referencia; TheSportsDB se consulta para contraste de eventos/escudos. Una respuesta parcial produce alerta y no altera una cita oficial ni introduce resultados inventados.

## Contratos

- `meta`: competencia, temporada, fuentes, fecha de captura, alertas de contraste y estado del torneo.
- `equipos[team]`: `bombo`, `pais`, `escudo` opcional y nombre de presentación.
- `partidos[]`: identificador estable, jornada/ronda, fecha, equipos, marcadores opcionales, estado y clasificado opcional.
- `clasificacion`: filas ordenadas por puntos y los desempates UEFA aplicables, con posición y estado de acceso a octavos.
- `fases`: representación de play-off y eliminatorias; una fase sin partidos confirmados se publica como pendiente.

## Reglas de puntuación

- La fase liga conserva puntuación por resultado.
- El play-off de acceso a octavos puntúa 4 por marcador exacto y 1 por 1X2.
- Cada club entre los ocho primeros recibe su bonus de acceso a octavos.
- Cada club de los puestos 9–24 que alcance octavos recibe su bonus una sola vez; los bonus posteriores siguen las rondas puntuables establecidas.
- La escala de resultado es 3/1 en fase liga, 6/2 en octavos, 8/3 en cuartos, 10/4 en semifinal y 12/5 en final; cada predicción debe estar confirmada una hora antes de empezar el partido.

## Presentación

- La cabecera usa la imagen de sorteo entregada por el usuario.
- Un único componente de etiqueta de equipo incorpora escudo opcional, nombre accesible y degradación sin imagen rota; se emplea en selección, partidos, tabla y eliminatorias.
- Las pestañas, filtros y etiquetas dejan de referirse a la temporada histórica y muestran el formato actual: ocho jornadas, tabla de liga y fases posteriores pendientes/dinámicas.

## Estrategia de pruebas

- Pruebas de semilla: 36 equipos, 4×9 bombos, 144 partidos, 8 jornadas, nombres canónicos y trazabilidad UEFA.
- Pruebas de clasificación: puntos y cadena de desempates UEFA con casos de empate.
- Pruebas de puntuación: play-off sin puntos; bonus de top 8 y de acceso a octavos desde 9–24, sin duplicados.
- Pruebas de integración: respuesta parcial o discrepante de TheSportsDB no sobrescribe la semilla y genera alerta.
- Comprobación del navegador mediante datos generados: el HTML contiene la cabecera y todas las apariciones de equipos usan la etiqueta de escudo segura.

## Riesgos y mitigación

| Riesgo | Mitigación |
| --- | --- |
| Cobertura incompleta de TheSportsDB para 2026/27 | UEFA mantiene los datos de torneo; registrar alerta y no depender del proveedor para publicar. |
| Variantes de nombre entre fuentes | Catálogo canónico y alias explícitos, cubiertos por pruebas. |
| Empates UEFA complejos | Implementar los criterios documentados con datos de prueba deterministas y preservar sus campos de cálculo. |
| Fases futuras desconocidas | Publicar estado pendiente, no cruces simulados. |

## Secuencia

1. Fijar contratos y pruebas rojas para semilla, clasificación y bonus.
2. Incorporar equipos, bombos, calendario y catálogo de escudos con trazabilidad.
3. Adaptar el motor y la actualización secundaria, después regenerar datos.
4. Adaptar web y estilos a los nuevos contratos y a la cabecera.
5. Ejecutar pruebas, generación y revisión visual; documentar evidencia.

## Tasks

| ID | [P] | Task | Done-check | Depends-on | Trace |
| --- | --- | --- | --- | --- | --- |
| T001 |  | Escribir pruebas rojas de semilla y puntuación Champions | Las pruebas nuevas fallan antes de implementar | — | Spec Acceptance 1,2,7 |
| T002 |  | Crear semilla 2026/27 y catálogo canónico de equipos | Pruebas de 36, 4×9, 144 y 8 jornadas verdes | T001 | Spec Acceptance 1,2 |
| T003 |  | Implementar tabla UEFA y fases pendientes | Pruebas de desempate y fases sin cruces verdes | T001 | Spec Acceptance 4,5,8 |
| T004 |  | Adaptar puntuación de acceso a octavos | Pruebas de play-off sin puntos y bonus no duplicado verdes | T001 | Spec Acceptance 9 |
| T005 |  | Añadir contraste SportsDB y escudos seguros | Pruebas de discrepancia y escudo ausente verdes | T002 | Spec Acceptance 3,7 |
| T006 |  | Adaptar web, cabecera y vistas de equipos/fases | Datos generados y comprobación manual sin imágenes rotas | T002,T003,T005 | Spec Acceptance 3,4,5,6 |
| T007 |  | Ejecutar validación integral y documentar evidencia | `python -m unittest discover -s tests` y build de datos salen 0 | T002-T006 | All acceptance |

## Review Workload Forecast

| Dimension | Forecast | Why |
| --- | --- | --- |
| Estimated changed lines | 700-1,100 | Datos oficiales, motor, pruebas y web. |
| Files / areas | 10-15 | Semilla, generador, puntuación, proveedor, tests y recursos públicos. |
| Review risk | High | Cambio de datos canónicos, reglas y UI. |
| Suggested delivery | ask-on-risk | Supera el presupuesto de revisión configurado. |
