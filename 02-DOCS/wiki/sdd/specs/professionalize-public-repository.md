---
type: spec
title: Spec - Profesionalizacion del repositorio publico
slug: professionalize-public-repository
status: implemented
updated: 2026-09-10
---

# Profesionalizacion del repositorio publico

## Objetivo

Hacer que el repositorio publico sea comprensible, reproducible y seguro para una persona que no conoce el proyecto, sin alterar el funcionamiento de la porra ni la integridad de los datos operativos.

## Alcance

- Conservar `02-DOCS/` como memoria del arnes y almacen de artefactos SDD.
- Mantener Python, la web estatica, Supabase y GitHub Pages como arquitectura de entrega.
- Publicar una sola semilla canonica para la temporada 2026/27 y eliminar datos heredados del Mundial que no formen parte del producto.
- Sustituir rutas locales y metadatos obsoletos por referencias portables y trazables.
- Eliminar codigo de demostracion o reglas heredadas que ya no sean alcanzables.
- Alinear README, reglas, seguridad, Supabase y automatizaciones con el comportamiento desplegado.
- Separar las comprobaciones de pull request de la ejecucion con secretos de produccion.
- Documentar la procedencia y las limitaciones de uso de activos de terceros sin atribuir licencias que no se hayan verificado.

## Fuera de alcance

- Cambiar las reglas, la puntuacion, la autenticacion o las politicas RLS aprobadas.
- Cambiar de proveedor de datos o de alojamiento.
- Elegir una licencia de codigo abierta en nombre del propietario.
- Modificar o borrar datos de usuarios en Supabase.

## Criterios de aceptacion

1. `02-DOCS/` sigue disponible y su indice enlaza esta iniciativa.
2. La aplicacion usa una unica semilla de 36 clubes y 144 partidos, con horarios y fuentes trazables.
3. Ningun dato publicado contiene rutas absolutas del equipo del autor, secretos o datos privados de participantes.
4. No quedan archivos de datos del Mundial ni codigo de interfaz heredado e inalcanzable.
5. README ofrece demo, requisitos, arranque minimo, validacion y enlaces a documentacion especifica.
6. Las reglas documentadas coinciden con la interfaz: selecciones obligatorias, J1 de cortesia solo para quiniela y reparto 60/20/20.
7. La guia de Supabase enumera todas las migraciones y el modelo Auth actual.
8. CI ejecuta pruebas Python, pruebas JavaScript y una generacion determinista sin secretos.
9. El flujo de produccion limita `service_role` al trabajo de sincronizacion y conserva Pages operativo.
10. La deteccion de eliminatorias funciona con la fase liga `J01`-`J08`, no con un marcador heredado del Mundial.
11. La suite completa, la generacion de datos y el escaneo de higiene terminan correctamente.
