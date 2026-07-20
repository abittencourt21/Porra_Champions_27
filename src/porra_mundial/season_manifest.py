from __future__ import annotations

import json
from pathlib import Path
from typing import Any

REQUIRED_SOURCE_FIELDS = ("source_uefa_pots_url", "source_uefa_fixtures_url")


def load_season_manifest(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def validate_manifest_for_capture(manifest: dict[str, Any]) -> None:
    if manifest.get("competition") != "UEFA Champions League":
        raise ValueError("El manifiesto debe identificar la UEFA Champions League.")
    if not manifest.get("season"):
        raise ValueError("El manifiesto debe incluir una temporada.")
    missing = [field for field in REQUIRED_SOURCE_FIELDS if not str(manifest.get(field, "")).strip()]
    if missing:
        raise ValueError(
            "No se puede preparar la semilla sin fuentes UEFA oficiales: " + ", ".join(missing)
        )
