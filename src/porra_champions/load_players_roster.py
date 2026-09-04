"""Convert the approved pre-tournament roster into the Pichichi catalogue."""
from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


TEAM_ALIASES = {"PSV": "PSV Eindhoven"}


def parse_roster(markdown: str) -> list[dict[str, str]]:
    """Parse ``## Club`` / ``- Player`` lines, preserving the supplied names."""
    team = ""
    rows: list[dict[str, str]] = []
    for line in markdown.splitlines():
        if line.startswith("## "):
            team = TEAM_ALIASES.get(line[3:].strip(), line[3:].strip())
        elif line.startswith("- ") and team:
            full_name = line[2:].strip()
            if full_name:
                rows.append({"team_name": team, "full_name": full_name})
    if not rows:
        raise ValueError("The roster does not contain any player rows")
    return rows


def catalogue_from_roster(markdown: str, source_url: str, captured_at: str | None = None) -> list[dict[str, str]]:
    captured_at = captured_at or datetime.now(timezone.utc).isoformat()
    rows = []
    for item in parse_roster(markdown):
        stable_key = f"{item['team_name']}|{item['full_name']}".encode("utf-8")
        digest = hashlib.sha256(stable_key).hexdigest()[:16]
        rows.append({
            "player_id": f"roster-2026:{digest}",
            "team_id": f"roster-2026:{hashlib.sha256(item['team_name'].encode('utf-8')).hexdigest()[:12]}",
            "team_name": item["team_name"],
            "full_name": item["full_name"],
            "source_provider": "Roster proporcionado por la organización",
            "source_url": source_url,
            "source_updated_at": captured_at,
            "uefa_list_type": "preseason",
        })
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--out", type=Path, default=Path("data/champions-2026-27/players.json"))
    parser.add_argument("--source-url", default="jugadores_champions_2026_27_nombres_completos.md")
    args = parser.parse_args()
    players = catalogue_from_roster(args.input.read_text(encoding="utf-8"), args.source_url)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(players, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Written {len(players)} players from {len({row['team_name'] for row in players})} teams to {args.out}")


if __name__ == "__main__":
    main()
