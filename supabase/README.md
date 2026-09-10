# Supabase

Supabase aporta autenticacion, almacenamiento privado de inscripciones y pronosticos, clasificaciones publicas y Row Level Security (RLS).

## Requisitos

- Un proyecto Supabase.
- Email con contrasena habilitado.
- Google OAuth habilitado si se ofrece ese boton.
- SMTP transaccional configurado; el proyecto usa Brevo.
- La URL de GitHub Pages y la URL local incluidas en **Authentication > URL Configuration**.

## Aplicar el esquema

Ejecuta las migraciones en orden cronologico con Supabase CLI o desde SQL Editor:

1. `20260831170000_champions_porrrra_rls.sql`
2. `20260901110000_public_participants.sql`
3. `20260903120000_players_and_secure_entries.sql`
4. `20260903150000_quinielista_ranking.sql`
5. `20260904110000_entry_diversity_and_editing.sql`
6. `20260907110000_j1_courtesy_and_j2_entry_deadline.sql`
7. `20260907120000_enforce_entry_diversity_on_edits.sql`
8. `20260910090000_closed_prediction_audit.sql`

No vuelvas a ejecutar manualmente una migracion parcialmente aplicada. Consulta primero las politicas y funciones existentes.

## Configurar el navegador

Copia `public/supabase-config.js.example` como `public/supabase-config.js` y completa la URL y la clave publishable del proyecto de desarrollo. No uses una clave `service_role` ni una clave `sb_secret_` en `public/`.

## Cargar y actualizar partidos

`matches.starts_at` es la fuente de verdad del cierre de pronosticos y se almacena con zona horaria. Para generar una semilla SQL repetible:

```powershell
$env:PYTHONPATH = "src"
python -m porra_champions.build_supabase_seed
```

El workflow de produccion genera `public/datos.json` y ejecuta `python -m porra_champions.sync_supabase` con `SUPABASE_SERVICE_ROLE_KEY`. El navegador nunca recibe ese secreto.

## Comprobacion minima

1. Crea dos usuarios.
2. Confirma que cada uno solo puede leer y editar su perfil, inscripcion y pronosticos.
3. Confirma que `public_participants` no expone emails.
4. Confirma que `closed_prediction_audit` no muestra un pronostico antes de su cierre.
5. Confirma que una inscripcion no puede coincidir en tres o mas equipos con otra.
