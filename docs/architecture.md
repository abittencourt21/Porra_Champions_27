# Arquitectura

La aplicación separa una interfaz estática de un backend administrado. GitHub Pages sirve HTML, CSS, JavaScript y un JSON de torneo; Supabase conserva identidad y datos privados.

## Flujo de lectura

1. El navegador descarga `public/datos.json` para conocer equipos, jornadas y resultados.
2. El cliente crea una sesión con la clave publishable de Supabase.
3. Las vistas públicas devuelven clasificaciones y selecciones aptas para publicar.
4. Las tablas privadas aplican RLS mediante `auth.uid()`.

## Flujo de actualización

1. GitHub Actions genera el JSON desde la semilla canónica.
2. El generador consulta TheSportsDB solo cuando hay partidos que actualizar o fases eliminatorias que descubrir.
3. Un job aislado sincroniza equipos, jugadores y partidos con la clave `service_role`.
4. Otro job despliega el mismo artefacto en GitHub Pages sin acceder a esa clave.

## Fuentes de verdad

| Dato | Fuente de verdad |
| --- | --- |
| Temporada, bombos y calendario base | `data/champions-2026-27/seed.json` |
| Usuarios | Supabase Auth |
| Perfiles, inscripciones y pronósticos | Tablas privadas de Supabase con RLS |
| Cierre de pronósticos | `public.matches.starts_at` |
| Reglas de base de datos | `supabase/migrations/` |
| Sitio desplegado | Artefacto generado por GitHub Actions |

`02-DOCS/` conserva decisiones y artefactos del arnés. No se copia al directorio `public/` ni forma parte del sitio.
