from __future__ import annotations

import argparse
from pathlib import Path

from .season_manifest import load_season_manifest, validate_manifest_for_capture


def main() -> None:
    parser = argparse.ArgumentParser(description="Valida que una temporada Champions puede capturarse desde UEFA.")
    parser.add_argument("--manifest", required=True, type=Path)
    args = parser.parse_args()
    manifest = load_season_manifest(args.manifest)
    validate_manifest_for_capture(manifest)
    print(
        f"Fuentes verificadas para {manifest['competition']} {manifest['season']}. "
        "Captura el HTML de bombos y calendario antes de generar una semilla candidata."
    )


if __name__ == "__main__":
    main()
