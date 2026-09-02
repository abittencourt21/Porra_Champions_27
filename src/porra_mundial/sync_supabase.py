"""Administrative SportsDB -> Supabase result synchronisation."""
from __future__ import annotations

import json, os
from urllib.request import Request, urlopen


def main() -> None:
    url = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    payload = json.load(open("public/datos.json", encoding="utf-8"))
    rows = [
        {
            "match_id": str(match["matchid"]),
            "round_code": match["ronda"],
            "starts_at": match["starts_at"],
            "home_team": match["home_team"],
            "away_team": match["away_team"],
            "status": match.get("status") or "NS",
            "home_score": match.get("home_score"),
            "away_score": match.get("away_score"),
        }
        for match in payload["partidos"]
        if match.get("matchid") is not None
        and match.get("ronda")
        and match.get("starts_at")
        and match.get("home_team")
        and match.get("away_team")
    ]
    if not rows:
        print("No matches eligible for synchronisation.")
        return
    request = Request(f"{url}/rest/v1/matches?on_conflict=match_id", data=json.dumps(rows).encode(), method="POST", headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    with urlopen(request, timeout=30) as response:
        print(f"Synced {len(rows)} matches and confirmed results (HTTP {response.status})")


if __name__ == "__main__":
    main()
