# Plan de refactor para Champions League 2026/2027

## Supuestos asumidos

- La base de puntuación de la porra se mantiene igual: resultados exactos y quinielas en grupos y eliminatorias, con el mismo sistema de bombo y bonus finales.
- La captación de datos seguirá usando TheSportsDB como fuente principal para partidos, resultados y rondas.
- El objetivo de mejora es la obtención inicial de los nombres de equipos y los IDs de los partidos desde la fuente externa, con un fallback robusto cuando la API no devuelve el partido esperado.
- La lógica de predicciones se implementa como una capa nueva que permite a los participantes apostar por cada partido antes de la jornada, entre el lunes y el martes previos.
- Para el control de usuarios y edición de predicciones se recomienda un enfoque de coste 0 usando GitHub Pages + JSON estático en primer momento; Supabase solo se considera una segunda fase si se quiere autenticación real y protección de escritura por usuario.

## Stack recomendado

1. Backend y lógica: Python con el motor actual de generación de datos.
2. Fuente de datos: TheSportsDB (sin coste adicional para la API pública actual).
3. Almacenamiento de predicciones: JSON local o en GitHub Actions output, con una exportación simple a datos.json.
4. Autenticación: evitar Supabase en la primera fase. Si se necesita control de usuarios, se puede introducir más adelante con Supabase o una solución de GitHub OAuth, pero eso no es imprescindible para el MVP.
5. Web: HTML/CSS/JS estático, compatible con GitHub Pages.

## Cambios implementados

- Nuevo módulo de predicciones con reglas de puntuación exacta y quiniela.
- Generación de ventanas de predicción por jornada para abrir/cerrar participación.
- Exposición de esas ventanas en el payload generado por build_data.
- Documentación del plan en la wiki del proyecto.
