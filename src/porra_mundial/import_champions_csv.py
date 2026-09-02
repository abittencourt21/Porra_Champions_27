from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .champions import CHAMPIONS_SEASON, UEFA_FIXTURES_URL, UEFA_POTS_URL, uefa_champions_pots

TEAM_ALIASES = {
    "Atlético Madrid": "Atlético de Madrid", "Bayern Munich": "Bayern München",
    "Inter Milan": "Inter", "RB Leipzig": "Leipzig", "Sabah Baku": "Sabah",
    "Slavia Prague": "Slavia Praha",
}


def build_seed(csv_path: Path) -> dict:
    rows = list(csv.DictReader(csv_path.read_text(encoding="utf-8-sig").splitlines()))
    matches = []
    for row in rows:
        timestamp = row.get("strTimestamp", "")
        if not ("2026-09-08" <= timestamp[:10] <= "2027-01-27"):
            continue
        round_number = int(str(row.get("Round", "")).removeprefix("Round "))
        utc_start = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        madrid_offset = timedelta(hours=1 if utc_start.month == 1 else 2)
        starts_at = utc_start.astimezone(timezone(madrid_offset)).isoformat()
        matches.append({
            "matchid": int(row["idEvent"]), "group": None, "roundnumber": round_number,
            "ronda": f"J{round_number:02d}", "competition_stage": "league",
            "fecha": datetime.strptime(timestamp[:10], "%Y-%m-%d").strftime("%d.%m.%Y"),
            "starts_at": starts_at,
            "home_team": TEAM_ALIASES.get(row["Home Team"], row["Home Team"]),
            "away_team": TEAM_ALIASES.get(row["Away Team"], row["Away Team"]),
            "home_score": None, "away_score": None, "home_score_90": None,
            "away_score_90": None, "pasa": None, "status": "NS", "source_url": "",
        })
    if len(matches) != 144 or {match["ronda"] for match in matches} != {f"J{i:02d}" for i in range(1, 9)}:
        raise ValueError(f"CSV incompleto: {len(matches)} partidos de fase liga")
    return {"meta": {"ultima_actualizacion": datetime.now(timezone.utc).isoformat(), "fuente": "UEFA 2026/27 (bombos); TheSportsDB 4480 (calendario/contraste)", "competition": "UEFA Champions League", "season": CHAMPIONS_SEASON, "source_uefa_url": UEFA_FIXTURES_URL, "source_uefa_pots_url": UEFA_POTS_URL, "source_sportsdb_csv": str(csv_path), "estado_torneo": "pre", "campeon": "", "subcampeon": "", "pichichi_nombre": "", "pichichi_goles": 0}, "bombos": uefa_champions_pots(), "participantes": [], "partidos": sorted(matches, key=lambda item: (item["roundnumber"], item["fecha"], item["matchid"])), "goleadores": []}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    args.out.write_text(json.dumps(build_seed(args.csv), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
