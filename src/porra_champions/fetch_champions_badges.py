from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=Path, required=True)
    args = parser.parse_args()
    seed = json.loads(args.seed.read_text(encoding="utf-8"))
    badges = dict(seed.get("meta", {}).get("team_badges", {}))
    for team in seed["bombos"]:
        query = urlencode({"t": team})
        try:
            with urlopen(f"https://www.thesportsdb.com/api/v1/json/123/searchteams.php?{query}", timeout=20) as response:
                teams = json.loads(response.read().decode("utf-8")).get("teams") or []
            if teams and teams[0].get("strBadge"):
                badges[team] = teams[0]["strBadge"]
        except Exception as exc:
            print(f"Aviso: no se obtuvo escudo de {team}: {exc}")
        time.sleep(1.1)
    seed.setdefault("meta", {})["team_badges"] = badges
    args.seed.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Escudos encontrados: {len(badges)}/{len(seed['bombos'])}")


if __name__ == "__main__":
    main()
