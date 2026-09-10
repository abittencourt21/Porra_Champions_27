# Como desplegar GitHub Pages

## Requisitos

- Pages configurado con **GitHub Actions** como origen.
- Las ocho migraciones de `supabase/migrations/` aplicadas.
- Los proveedores Auth y las URLs de redirección configurados en Supabase.

## Secrets de GitHub

Configura en **Settings > Secrets and variables > Actions**:

| Secret | Uso |
| --- | --- |
| `SUPABASE_URL` | URL pública del proyecto. |
| `SUPABASE_PUBLISHABLE_KEY` | Configuración del cliente web. |
| `SUPABASE_SERVICE_ROLE_KEY` | Sincronización administrativa; nunca llega a Pages. |

## Desplegar

1. Abre **Actions > Build, sync and deploy Pages**.
2. Ejecuta **Run workflow** sobre `main`.
3. Comprueba que los jobs `build`, `sync-supabase` y `deploy` terminan correctamente.
4. Abre la URL indicada por el environment `github-pages`.
5. Verifica reglas, clasificación, inicio de sesión y una jornada.

El workflow tambien se ejecuta al actualizar `main` y cada dia a las 04:30 UTC. Durante el horario de verano de Madrid corresponde a las 06:30; durante el horario de invierno, a las 05:30.

## Recuperación

Si falla la fuente externa, el generador conserva resultados confirmados del último `datos.json` publicado. Corrige la fuente o un alias y vuelve a ejecutar el workflow. No modifiques pronósticos ni perfiles para recuperar un despliegue.
