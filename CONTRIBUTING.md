# Cómo contribuir

## Preparar el entorno

Usa Python 3.12 o posterior y sigue el inicio rápido del `README.md`. No copies credenciales de producción a tu entorno local.

## Antes de proponer un cambio

1. Crea una rama con un nombre relacionado con el cambio.
2. Actualiza la documentación junto con el comportamiento que describe.
3. Ejecuta las pruebas Python y JavaScript.
4. Genera `public/datos.json` con una fecha determinista y sin `PREVIOUS_DATOS_URL`.
5. Revisa que el diff no contenga correos electrónicos, rutas locales, claves ni archivos generados.

No edites una migración ya aplicada. Crea una nueva migración con un timestamp posterior.

## Commits

Usa asuntos breves y orientados al resultado, por ejemplo:

```text
fix: preserve match results when SportsDB is unavailable
docs: clarify Supabase migration order
```
