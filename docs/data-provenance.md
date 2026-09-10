# Procedencia de los datos

## Temporada 2026/27

| Conjunto | Archivo | Procedencia |
| --- | --- | --- |
| Bombos y calendario | `data/champions-2026-27/seed.json` | UEFA como referencia oficial; TheSportsDB 4480 como contraste y actualización. |
| Manifiesto | `data/champions-2026-27/manifest.json` | URLs oficiales y fechas relevantes de la temporada. |
| Jugadores | `data/champions-2026-27/players.json` | Lista de pretemporada proporcionada por la organización el 4 de septiembre de 2026. |
| Escudos | `public/assets/clubs/` | Selección local del repositorio `JoseArroyave/football-logos`. |

La propiedad `source_sportsdb_csv` es una referencia lógica portable. No contiene la ruta del ordenador donde se realizó la importación.

## Datos generados

- `public/datos.json` se genera durante CI o despliegue y no se versiona.
- `supabase/seed_matches.sql` se genera desde la semilla canónica y debe poder regenerarse sin cambios inesperados.
- Los resultados anteriores se recuperan de la versión publicada para evitar perder marcadores cuando la API externa no responde.

## Datos de participantes

Los datos privados viven en Supabase. Git solo puede contener ejemplos ficticios bajo `data/examples/`. Los pronósticos de otras personas se publican mediante una vista controlada cuando su plazo ya ha cerrado.
