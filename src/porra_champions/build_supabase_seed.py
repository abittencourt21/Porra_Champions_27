"""Generate repeatable SQL to seed Supabase's canonical Champions fixtures."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def sql_literal(value: str | None) -> str:
    if value is None:
        return "null"
    return "'" + str(value).replace("'", "''") + "'"


def build_sql(seed: dict) -> str:
    rows = seed["partidos"]
    if len(rows) != 144:
        raise ValueError(f"Se esperaban 144 partidos; recibidos {len(rows)}")
    values = []
    for match in rows:
        values.append("(" + ", ".join([
            sql_literal(str(match["matchid"])), sql_literal(match["ronda"]),
            sql_literal(match["starts_at"]), sql_literal(match["home_team"]),
            sql_literal(match["away_team"]), sql_literal(match.get("status", "NS")),
            sql_literal(match.get("home_score")), sql_literal(match.get("away_score")),
        ]) + ")")
    return "-- Generated from data/seed.json. Do not edit manually.\ninsert into public.matches (match_id, round_code, starts_at, home_team, away_team, status, home_score, away_score)\nvalues\n  " + ",\n  ".join(values) + "\non conflict (match_id) do update set\n  round_code = excluded.round_code, starts_at = excluded.starts_at,\n  home_team = excluded.home_team, away_team = excluded.away_team, status = excluded.status,\n  home_score = excluded.home_score, away_score = excluded.away_score;\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=Path, default=Path("data/seed.json"))
    parser.add_argument("--out", type=Path, default=Path("supabase/seed_matches.sql"))
    args = parser.parse_args()
    payload = json.loads(args.seed.read_text(encoding="utf-8"))
    args.out.write_text(build_sql(payload), encoding="utf-8")


if __name__ == "__main__":
    main()
