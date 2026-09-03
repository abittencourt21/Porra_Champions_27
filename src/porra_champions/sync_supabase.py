"""Administrative SportsDB -> Supabase result synchronisation."""
from __future__ import annotations

import json, os
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from .players import catalogue_rows


def main() -> None:
    url = os.environ["SUPABASE_URL"].rstrip("/")
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    payload = json.load(open("public/datos.json", encoding="utf-8"))
    players_path = "data/champions-2026-27/players.json"
    try:
        players = catalogue_rows(json.load(open(players_path, encoding="utf-8")))
    except FileNotFoundError:
        players = []
    teams = [
        {"team_name": name, "pot": int(pot), "season": str(payload.get("meta", {}).get("season", "2026-2027"))}
        for name, pot in payload.get("bombos", {}).items()
    ]
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
    team_request = Request(f"{url}/rest/v1/tournament_teams?on_conflict=team_name", data=json.dumps(teams).encode(), method="POST", headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    try:
        with urlopen(team_request, timeout=30) as response:
            print(f"Synced {len(teams)} tournament teams (HTTP {response.status})")
    except HTTPError as error:
        if error.code != 404:
            raise
        print("Tournament teams sync skipped: apply migration 20260903120000_players_and_secure_entries.sql in Supabase.")
    if players:
        player_request = Request(f"{url}/rest/v1/players?on_conflict=player_id", data=json.dumps(players).encode(), method="POST", headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
        try:
            with urlopen(player_request, timeout=30) as response:
                print(f"Synced {len(players)} UEFA players (HTTP {response.status})")
        except HTTPError as error:
            if error.code != 404:
                raise
            print("Players sync skipped: apply migration 20260903120000_players_and_secure_entries.sql in Supabase.")
    request = Request(f"{url}/rest/v1/matches?on_conflict=match_id", data=json.dumps(rows).encode(), method="POST", headers={"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates"})
    with urlopen(request, timeout=30) as response:
        print(f"Synced {len(rows)} matches and confirmed results (HTTP {response.status})")


if __name__ == "__main__":
    main()
