# SDD decisions

## 2026-09-03 — Acceso sin Magic Link (feature: auth-password-social-login)

- Supabase Auth mantiene la identidad y RLS existentes; se sustituyen solo los métodos de acceso del navegador.
- Google y Azure/Microsoft son las vías principales; email/contraseña cubre alta, acceso y recuperación. Brevo queda limitado a los correos imprescindibles.
- No se fusionan automáticamente cuentas OAuth y preexistentes: cualquier `auth.users.id` distinto se trata administrativamente para proteger perfiles y pronósticos.

## 2026-07-20 — Alcance de la semilla histórica Champions

- Se usará la UEFA Champions League 2025-26 como semilla histórica de referencia.
- El alcance empieza en la fase liga y termina en la final; se excluyen las rondas de clasificación.
- TheSportsDB es la fuente de trazabilidad acordada. La página de temporada indicada por el usuario es la referencia de comprobación.
- Los bombos serán los cuatro grupos oficiales UEFA de la fase liga 2025-26, publicados por UEFA el 28 de agosto de 2025.
- Se versionará una semilla reproducible y trazable, en lugar de depender de una consulta de red en cada build.
- La constitución inicial ratifica Python + web estática, TDD con unittest, trazabilidad de datos, privacidad y UI dirigida por datos para esta entrega automática.
- UEFA será la fuente primaria de calendario y resultados 2025-26 porque la API gratuita de TheSportsDB solo devuelve cinco eventos de previas; TheSportsDB queda como referencia secundaria cuando haya datos disponibles.

## 2026-07-20 — Corrección de expectativa de predicciones  (feature: historical-champions-seed)

Repro: la suite esperaba 4 puntos para un pronóstico 0-0 contra un resultado 1-0.
Cause: el empate pronosticado no acierta el signo del resultado; `prediction_points` devuelve correctamente 0.
Fix: se corrige la expectativa de la prueba a 3 puntos totales y 0 en ese partido.

## 2026-08-31 - Fuente de datos para Champions 2026/27 (feature: champions-2026-27-migration)

- Se aprueba UEFA como fuente canónica de participantes, bombos, calendario y fases de la temporada 2026/27.
- TheSportsDB queda limitado a contraste y enriquecimiento visual con escudos; cualquier discrepancia prevalece a favor de UEFA.
- El bonus de acceso a octavos mantiene el valor del bombo: top 8 directo o ganador del play-off desde 9–24; el play-off no concede puntos propios.
