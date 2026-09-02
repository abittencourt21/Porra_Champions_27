from __future__ import annotations

from datetime import datetime
from html import unescape
import re
from typing import Any

CHAMPIONS_LEAGUE_ID = "4480"
CHAMPIONS_SEASON = "2026-2027"
UEFA_FIXTURES_URL = (
    "https://www.uefa.com/uefachampionsleague/news/"
    "02a8-2174c9e9019d-f909a77bd77a-1000--2026-27-champions-league-all-the-league-phase-fixtures/"
)
UEFA_POTS_URL = (
    "https://www.uefa.com/uefachampionsleague/news/"
    "02a8-21717d0c6cb5-03a9a5ff1552-1000--champions-league-league-phase-draw-pots-confirmed/"
)

_UEFA_POTS = (
    ("Paris Saint-Germain", "Bayern München", "Real Madrid", "Liverpool", "Inter", "Manchester City", "Arsenal", "Barcelona", "Atlético de Madrid"),
    ("Borussia Dortmund", "Roma", "Sporting CP", "Aston Villa", "Porto", "Manchester United", "Club Brugge", "Real Betis", "PSV Eindhoven"),
    ("Feyenoord", "Lille", "Bodø/Glimt", "Napoli", "Leipzig", "Villarreal", "Fenerbahçe", "Shakhtar Donetsk", "Galatasaray"),
    ("Slavia Praha", "Slovan Bratislava", "Stuttgart", "AEK Athens", "LASK", "Como", "Lens", "Viking", "Sabah"),
)

_UEFA_TEAM_ALIASES = {
    "Paris": "Paris Saint-Germain",
    "Man City": "Manchester City",
    "Atleti": "Atlético de Madrid",
    "B. Dortmund": "Borussia Dortmund",
    "Man Utd": "Manchester United",
    "PSV": "PSV Eindhoven",
    "S. Bratislava": "Slovan Bratislava",
}


def uefa_champions_pots() -> dict[str, int]:
    """Return the official UEFA 2025-26 league-phase draw pots."""
    return {
        club: pot
        for pot, clubs in enumerate(_UEFA_POTS, start=1)
        for club in clubs
    }


def parse_uefa_fixture_html(html: str) -> list[dict[str, Any]]:
    """Extract included 2025-26 matches from UEFA's published results article."""
    headings = list(re.finditer(r"<h([23])[^>]*>(.*?)</h\1>", html, re.I | re.S))
    matches: list[dict[str, Any]] = []
    for paragraph in re.finditer(r"<p\b[^>]*>(.*?)</p>", html, re.I | re.S):
        context = _fixture_context(html, paragraph.start(), headings)
        stage = _stage_from_context(context)
        if stage is None:
            continue
        text = paragraph.group(1)
        date = _date_from_paragraph(text)
        if not date:
            continue
        for href, label in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', text, re.I | re.S):
            parsed = _parse_result_label(_plain_text(label))
            event_id = re.search(r"/match/(\d+)--", href)
            if parsed is None or event_id is None:
                continue
            home, home_score, away_score, away = parsed
            matches.append(
                {
                    "matchid": int(event_id.group(1)),
                    "group": None,
                    "roundnumber": _matchday_from_context(context),
                    "ronda": stage,
                    "competition_stage": "league" if stage.startswith("J") else "knockout",
                    "fecha": date,
                    "home_team": _canonical_team(home),
                    "away_team": _canonical_team(away),
                    "home_score": home_score,
                    "away_score": away_score,
                    "home_score_90": home_score,
                    "away_score_90": away_score,
                    "pasa": None,
                    "status": "FT",
                    "source_url": href,
                }
            )
    return matches


def build_historical_seed(html: str, *, captured_at: str) -> dict[str, Any]:
    matches = parse_uefa_fixture_html(html)
    expected = {f"J{matchday:02d}": 18 for matchday in range(1, 9)} | {
        "R32": 16, "R16": 16, "QF": 8, "SF": 4, "F": 1,
    }
    actual = {stage: sum(match["ronda"] == stage for match in matches) for stage in expected}
    if actual != expected:
        raise ValueError(f"Fixture UEFA incompleto o inconsistente: {actual}")
    return {
        "meta": {
            "ultima_actualizacion": captured_at,
            "fuente": "UEFA Champions League 2025-26 (fuente primaria); TheSportsDB liga 4480 (contraste secundario)",
            "competition": "UEFA Champions League",
            "season": CHAMPIONS_SEASON,
            "source_uefa_url": UEFA_FIXTURES_URL,
            "source_uefa_pots_url": UEFA_POTS_URL,
            "source_sportsdb_url": f"https://www.thesportsdb.com/season/{CHAMPIONS_LEAGUE_ID}-uefa-champions-league/{CHAMPIONS_SEASON}",
            "estado_torneo": "finalizado",
            "campeon": "Paris Saint-Germain",
            "subcampeon": "Arsenal",
            "pichichi_nombre": "",
            "pichichi_goles": 0,
        },
        "bombos": uefa_champions_pots(),
        "participantes": [],
        "partidos": sorted(matches, key=lambda item: (item["fecha"], item["matchid"])),
        "goleadores": [],
    }


def _fixture_context(html: str, position: int, headings: list[re.Match[str]]) -> str:
    prior = [match for match in headings if match.start() < position]
    latest_h2 = next((match for match in reversed(prior) if match.group(1) == "2"), None)
    latest_h3 = next((match for match in reversed(prior) if match.group(1) == "3"), None)
    values = [_plain_text(match.group(2)) for match in (latest_h2, latest_h3) if match]
    return " ".join(values)


def _stage_from_context(context: str) -> str | None:
    value = context.casefold()
    if "league phase" in value:
        return f"J{_matchday_from_context(context):02d}" if _matchday_from_context(context) else None
    if "knockout phase play-off" in value:
        return "R32"
    if "round of 16" in value:
        return "R16"
    if "quarter-final" in value:
        return "QF"
    if "semi-final" in value:
        return "SF"
    if "final" in value:
        return "F"
    return None


def _matchday_from_context(context: str) -> int | None:
    match = re.search(r"matchday\s+(\d+)", context, re.I)
    return int(match.group(1)) if match else None


def _date_from_paragraph(value: str) -> str | None:
    plain = _plain_text(value)
    date_match = re.search(r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4})", plain)
    if date_match:
        return datetime.strptime(date_match.group(1), "%d %B %Y").strftime("%d.%m.%Y")
    short_match = re.search(r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(\d{1,2}\s+[A-Za-z]+)", plain)
    if short_match:
        return datetime.strptime(f"{short_match.group(1)} 2026", "%d %B %Y").strftime("%d.%m.%Y")
    return None


def _parse_result_label(label: str) -> tuple[str, int, int, str] | None:
    match = re.match(r"(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)(?:\s+\(|$)", label.strip())
    if match is None:
        return None
    return match.group(1), int(match.group(2)), int(match.group(3)), re.sub(r"\s+(?:aet|pens)$", "", match.group(4), flags=re.I)


def _canonical_team(value: str) -> str:
    cleaned = value.replace("\ufeff", "").strip()
    return _UEFA_TEAM_ALIASES.get(cleaned, cleaned)


def _plain_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", unescape(value))).strip()
