# Porra Champions League

Aplicación estática con Supabase para la porra de la UEFA Champions League
2026/27: inscripción privada, pronósticos por partido y clasificación pública.

## Datos y trazabilidad

`data/seed.json` contiene el calendario base de la fase liga. `public/datos.json`
es la versión publicada y las fases posteriores se incorporan solo cuando están
confirmadas oficialmente.

- Fuente primaria: resultados y calendario publicados por UEFA.
- Bombos: anuncio oficial de UEFA para la fase liga 2026/27.
- Contraste secundario: TheSportsDB, liga 4480.
- Escudos locales: selección de SVG de `JoseArroyave/football-logos` (MIT),
  limitada a los clubes participantes.

Las URLs exactas y el momento de captura quedan en `meta` y en cada
`partido.source_url`. El tier gratuito de TheSportsDB no ofrece cobertura
completa de esta temporada, por lo que no sustituye a UEFA como fuente primaria.

## Reglas

Las reglas completas se muestran en la pestaña **Reglas** de la aplicación.

Las fechas de inscripción, pago y formulario de una nueva edición se decidirán
antes de abrirla; no se infieren de los datos históricos.

## Ejecutar y validar

En Windows, si `python` apunta al alias de Microsoft Store, usa la instalación
real de Python 3.12:

```powershell
$env:PYTHONPATH = "src"
$py = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
& $py -m unittest discover -s tests
& $py -m porra_champions.build_data --out public/datos.json
```

Después sirve `public/` con cualquier servidor estático y abre `index.html`.

## Datos y Supabase

La semilla y el manifiesto dejan trazabilidad de las fuentes UEFA. Para preparar
la tabla de partidos de Supabase:

```powershell
$env:PYTHONPATH = "src"
& $py -m porra_champions.build_supabase_seed
```

Consulta [`supabase/README.md`](supabase/README.md) para migraciones, RLS y la
sincronización administrativa.

## Acceso de participantes

La web usa Supabase Auth con Google, Microsoft y email/contraseña. Brevo se
utiliza solo para confirmar nuevas cuentas y recuperar una contraseña. En
**Supabase > Authentication > Providers**, habilita Email (contraseña), Google
y Azure. En **URL Configuration**, añade como Site URL y Redirect URL:
`https://abittencourt21.github.io/Porra_Champions_27/`.

En Google Cloud y Microsoft Entra registra exactamente el callback que muestra
Supabase y guarda los Client Secret solo allí. Antes de abrir la porra, prueba
una cuenta que hubiera entrado por Magic Link: debe conservar alias,
inscripción y pronósticos; no enlaces manualmente dos cuentas distintas.

## Publicar en GitHub Pages

En el repositorio, activa **Settings > Pages > Source: GitHub Actions** y añade
estos secretos en **Settings > Secrets and variables > Actions**:

- `SUPABASE_URL`: Project URL de Supabase.
- `SUPABASE_PUBLISHABLE_KEY`: clave publishable (anon) del proyecto.
- `SUPABASE_SERVICE_ROLE_KEY`: clave `service_role`, solo para la sincronización
  administrativa de partidos. Nunca se envía al navegador.

El flujo `Build and deploy Pages` crea en cada despliegue el archivo público de
configuración con los dos primeros secretos. Tras guardarlos, ejecútalo desde
**Actions > Build and deploy Pages > Run workflow**.

## Estructura

- `data/champions-2026-27/`: datos de temporada importados y trazables.
- `public/`: GitHub Pages y `datos.json` generado.
- `src/porra_champions/`: importación, puntuación y generador.
- `tests/`: validaciones del calendario, bombos y reglas.
- `docs/archive/`: recursos históricos del Mundial, aislados del producto.
- `02-DOCS/wiki/sdd/`: especificación, plan y progreso del cambio.
