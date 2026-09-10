---
type: plan
title: Plan - Profesionalizacion del repositorio publico
slug: professionalize-public-repository
status: approved-autopilot
updated: 2026-09-10
---

# Plan

## Restricciones globales

- `02-DOCS/` pertenece al arnes y no se mueve ni se publica como contenido de Pages.
- Cada cambio debe ser reversible mediante Git y conservar la salida funcional de `public/`.
- Los secretos permanecen en GitHub/Supabase; nunca se escriben para probar el proyecto.
- La semilla canonica conserva exactamente 36 clubes, cuatro bombos, 144 partidos y `starts_at`.
- No se cambia la semantica de puntuacion ni de privacidad.

## Arquitectura objetivo

- `data/champions-2026-27/`: semilla, jugadores y manifiesto de procedencia de la temporada.
- `data/examples/`: entradas ficticias aptas para publicacion.
- `docs/`: documentacion publica por objetivo; `02-DOCS/`: memoria exclusiva del arnes.
- `.github/workflows/ci.yml`: comprobaciones sin secretos.
- `.github/workflows/deploy-pages.yml`: construccion, sincronizacion aislada y despliegue.

## Tareas

### T001 - Proteger las invariantes del repositorio

- Crear pruebas que fallen con rutas locales, fuentes incompletas, semillas duplicadas, datos heredados y workflows sin test JavaScript.
- Done: las pruebas reproducen los defectos actuales antes de la limpieza.

### T002 - Consolidar datos y procedencia

- Convertir `data/champions-2026-27/seed.json` en la unica semilla canonica usando la version que contiene horarios.
- Mover el manifiesto y los ejemplos a sus carpetas de dominio.
- Eliminar datos y recursos heredados del Mundial que no son usados.
- Hacer que el importador guarde una referencia portable a la fuente.
- Done: 36 clubes, 144 partidos, fuentes completas, sin rutas locales y sin duplicados.

### T003 - Retirar codigo heredado y corregir integridad operativa

- Eliminar constantes y formularios demo inalcanzables del navegador.
- Corregir la referencia de TheSportsDB a la liga 4480.
- Detectar el momento de descubrir eliminatorias a partir de `J08` y calcular checkpoints con `J01`-`J08`.
- Done: pruebas de regresion verdes y ninguna referencia operativa al Mundial.

### T004 - Reescribir la entrada documental

- Convertir README en una portada con inicio rapido y enlaces.
- Crear documentos separados de arquitectura, despliegue y procedencia.
- Actualizar reglas, seguridad, Supabase y avisos de terceros.
- Done: la documentacion coincide con el producto y no requiere rutas particulares del autor.

### T005 - Profesionalizar automatizaciones y metadatos

- Anadir CI de pull requests sin secretos y separar permisos por trabajo en el despliegue.
- Anadir Dependabot y plantilla de pull request.
- Declarar correctamente el paquete Python y sus dependencias de desarrollo.
- Done: CI cubre Python, JavaScript y build determinista; el secreto administrativo solo existe en el job de sincronizacion.

### T006 - Verificar y revisar

- Ejecutar suites, build determinista, validacion de JSON, escaneo de secretos y comprobacion del diff.
- Revisar aceptacion, compatibilidad de Pages, rutas, licencias y datos borrados.
- Done: evidencia guardada en `02-DOCS/wiki/sdd/verifications/` y veredicto de revision aprobado.

## Riesgos y mitigaciones

- Cambiar la ruta de la semilla puede romper scripts: se cubren todas las referencias con busqueda y pruebas.
- Separar jobs puede perder el artefacto generado: se transfiere `public/` explicitamente y se valida la estructura.
- Eliminar compatibilidad heredada puede ocultar una dependencia: solo se retira codigo inalcanzable o datos sin referencias.
- La licencia es una decision juridica del propietario: se documenta el estado y no se concede una licencia por defecto.
