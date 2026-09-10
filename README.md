# Porra Champions League 2026/27

[![CI](https://github.com/abittencourt21/Porra_Champions_27/actions/workflows/ci.yml/badge.svg)](https://github.com/abittencourt21/Porra_Champions_27/actions/workflows/ci.yml)
[![Pages](https://github.com/abittencourt21/Porra_Champions_27/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/abittencourt21/Porra_Champions_27/actions/workflows/deploy-pages.yml)

Aplicación web estática para gestionar una porra privada de la UEFA Champions League 2026/27. Usa Supabase para autenticación y datos de participantes, y GitHub Pages para publicar la interfaz.

[Abrir la aplicacion](https://abittencourt21.github.io/Porra_Champions_27/) · [Ver reglas](REGLAS_PARTICIPANTES.md) · [Estado del despliegue](https://github.com/abittencourt21/Porra_Champions_27/actions/workflows/deploy-pages.yml)

## Funcionalidades

- Inscripción segura con Google o email y contraseña.
- Selección de un club por bombo, campeón, subcampeón y pichichi.
- Pronósticos guardados por partido o de forma masiva.
- Clasificación general y Premio Quinielista con desglose auditable.
- Actualización automática de partidos mediante TheSportsDB.
- Protección de datos mediante Row Level Security (RLS) de Supabase.

## Requisitos

- Python 3.12 o posterior.
- Node.js 24 para las pruebas JavaScript y los workflows.
- Un servidor HTTP local; Python incluye uno.
- Un proyecto Supabase para probar autenticación y escritura de datos.

## Inicio rápido

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -e .
$env:PYTHONPATH = "src"
$env:PREVIOUS_DATOS_URL = ""
$env:BUILD_DATE = "2026-09-07"
.venv\Scripts\python -m porra_champions.build_data --out public/datos.json
Copy-Item public/supabase-config.js.example public/supabase-config.js
.venv\Scripts\python -m http.server 8000 --directory public
```

Abre `http://localhost:8000`. La navegación pública funciona con la configuración de ejemplo; para probar altas y pronósticos, completa `public/supabase-config.js` con la URL y la clave publishable de un proyecto de desarrollo.

## Validación

```powershell
$env:PYTHONPATH = "src"
python -m unittest discover -s tests
node --test --test-isolation=none tests/auth.test.cjs
```

Resultado esperado: todas las pruebas terminan con estado correcto y el generador produce `public/datos.json`.

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `public/` | Aplicación estática desplegada en GitHub Pages. |
| `src/porra_champions/` | Importación, normalización, puntuación y sincronización. |
| `data/champions-2026-27/` | Semilla canónica, jugadores y procedencia de la temporada. |
| `supabase/migrations/` | Esquema, funciones y políticas RLS versionadas. |
| `tests/` | Pruebas de dominio, fuentes, seguridad e higiene del repositorio. |
| `docs/` | Documentación pública de arquitectura, despliegue y datos. |
| `02-DOCS/` | Memoria del arnés SDD; no forma parte del sitio publicado. |

## Documentación

- [Arquitectura](docs/architecture.md)
- [Despliegue y operacion](docs/deployment.md)
- [Procedencia de los datos](docs/data-provenance.md)
- [Configuración de Supabase](supabase/README.md)
- [Política de seguridad](SECURITY.md)
- [Cómo contribuir](CONTRIBUTING.md)

## Estado y licencia

El proyecto está operativo para la temporada 2026/27. El código no tiene todavía una licencia de reutilización; que el repositorio sea público no concede permiso para copiarlo o redistribuirlo. Consulta [avisos de terceros](THIRD_PARTY_NOTICES.md) antes de reutilizar sus activos.
