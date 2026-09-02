# Supabase: puesta en marcha gratuita

## Brevo + Magic Link

Email / Magic Link viene habilitado por defecto. En **Authentication > SMTP Settings > Custom SMTP** configura Brevo con host `smtp-relay.brevo.com`, puerto `587`, el SMTP login y SMTP key de Brevo, y una dirección remitente verificada. Estos secretos solo viven en Supabase.

Brevo Free incluye correo transaccional y 300 envíos diarios. Verifica SPF, DKIM y DMARC para el dominio remitente. Antes de abrir inscripciones masivamente, revisa **Authentication > Rate Limits**: Supabase inicia los correos Auth con SMTP propio en 30 por hora.

## Carga de partidos

Genera el SQL repetible con `python -m porra_mundial.build_supabase_seed`. Después abre `supabase/seed_matches.sql` en el SQL Editor y ejecútalo. La tabla `matches.starts_at` es la fuente de verdad del cierre de cada pronóstico.

1. Crea un proyecto Free y habilita **Email / Magic Link**. Configura la URL de producción y las redirecciones autorizadas de GitHub Pages.
2. Copia `public/supabase-config.js.example` a `public/supabase-config.js`; completa la URL y la clave publishable. No uses una clave `service_role` ni `sb_secret_` en `public/`.
3. Aplica `migrations/20260831170000_champions_porrrra_rls.sql` con la CLI o el SQL Editor.
4. Sincroniza los 144 partidos de `public/datos.json` en `public.matches` antes de abrir la porra. `starts_at` es la fuente de verdad del cierre, siempre en UTC.
5. En Authentication > URL Configuration, añade el dominio de GitHub Pages y la URL de desarrollo.

El navegador emplea solo la clave publishable. La modificación de resultados, partidos y cálculo de clasificación corresponde a un proceso de administración con secreto, nunca a la web estática.
