# Seguridad

## Informar de una vulnerabilidad

No publiques credenciales, datos personales ni detalles explotables en una incidencia publica. Contacta de forma privada con el propietario del repositorio y describe el impacto, los pasos de reproduccion y la version afectada.

## Datos que nunca se versionan

- Emails, nombres reales, telefonos o datos de pago de participantes.
- Claves `service_role`, secretos SMTP u OAuth y tokens de acceso.
- Archivos `.env`, credenciales de Google, claves privadas o exportaciones de Supabase.
- Exportaciones completas de participantes o pronosticos que aun no hayan cerrado.

La clave publishable de Supabase puede estar en el navegador: la proteccion depende de las politicas Row Level Security, no de ocultar esa clave. La clave `service_role` solo se usa en el job administrativo de GitHub Actions.

## Datos publicos previstos

- Alias del participante y equipos elegidos.
- Puntuacion y desglose de la clasificacion.
- Pronosticos confirmados despues de su cierre.
- Partidos, resultados, bombos y catalogo de jugadores.

## Controles del repositorio

- `public/datos.json` y `public/supabase-config.js` se generan y no se versionan.
- Las migraciones de `supabase/migrations/` mantienen las politicas RLS junto al codigo.
- CI valida que no se publiquen rutas locales, datos heredados ni configuraciones con secretos.
- Si una credencial llega a Git, revocala primero y limpia despues el historial; borrar solo el archivo no invalida la clave.

