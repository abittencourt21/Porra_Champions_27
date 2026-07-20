# Porra Champions League

MVP estático para una porra de la UEFA Champions League. La publicación actual
usa como semilla histórica la temporada 2025/26, no una convocatoria abierta de
la edición 2026/27.

## Datos y trazabilidad

`data/seed.json` contiene 189 partidos terminados: 144 de las ocho jornadas de
la fase liga y 45 eliminatorios. `public/datos.json` es la versión publicada.

- Fuente primaria: resultados y calendario publicados por UEFA.
- Bombos: anuncio oficial de UEFA para la fase liga 2025/26.
- Contraste secundario: [TheSportsDB, liga 4480](https://www.thesportsdb.com/season/4480-uefa-champions-league/2025-2026).

Las URLs exactas y el momento de captura quedan en `meta` y en cada
`partido.source_url`. El tier gratuito de TheSportsDB no ofrece cobertura
completa de esta temporada, por lo que no sustituye a UEFA como fuente primaria.

## Reglas

Cada participante escoge cuatro clubes, uno de cada bombo UEFA. Suma 3 puntos
por victoria, 1 por empate y 0 por derrota en la fase liga; en eliminatorias
solo cuenta el resultado a 90 minutos. Cada ronda eliminatoria superada añade
un bonus equivalente al número de bombo. Los detalles operativos están en
[`REGLAS_PARTICIPANTES.md`](REGLAS_PARTICIPANTES.md).

Las fechas de inscripción, pago y formulario de una nueva edición se decidirán
antes de abrirla; no se infieren de los datos históricos.

## Ejecutar y validar

En Windows, si `python` apunta al alias de Microsoft Store, usa la instalación
real de Python 3.12:

```powershell
$env:PYTHONPATH = "src"
$py = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
& $py -m unittest discover -s tests
& $py -m porra_mundial.build_data --out public/datos.json
```

Después sirve `public/` con cualquier servidor estático y abre `index.html`.

## Estructura

- `data/seed.json`: semilla histórica trazable.
- `public/`: GitHub Pages y `datos.json` generado.
- `src/porra_mundial/`: importación, puntuación y generador.
- `tests/`: validaciones del calendario, bombos y reglas.
- `02-DOCS/wiki/sdd/`: especificación, plan y progreso del cambio.
