# Modelo de usuarios y predicciones para la Champions

## Identidad del usuario

Cada participante se identifica de forma estable con:

- `user_id`: generado a partir del email
- `email`: email normalizado en minúsculas
- `alias`: nombre visible del usuario

La identidad se genera con un identificador estable (`user::email`) para evitar duplicados y permitir que cada usuario se recupere siempre con el mismo perfil.

## Privacidad y aislamiento

Cada usuario solo debería poder ver y modificar:

- sus propios perfiles
- sus propias predicciones
- su propio estado de edición

La regla de negocio es simple:

- si el usuario coincide con el `user_id` del registro, puede editar
- si no coincide, no puede acceder a esos datos

## Contrato de datos

```json
{
  "user_id": "user::usuario@example.com",
  "email": "usuario@example.com",
  "alias": "Juan",
  "predictions": [
    { "matchid": 1, "home_score": 2, "away_score": 1 }
  ]
}
```

## Implementación recomendada

En la primera fase se mantiene el almacenamiento en un JSON de entrada que GitHub Actions procesa. La separación entre usuarios se realiza por `user_id`, y la edición se limita a los partidos que aún no han empezado.
