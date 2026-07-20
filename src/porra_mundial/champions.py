from __future__ import annotations


CHAMPIONS_LEAGUE_ID = "4480"
CHAMPIONS_SEASON = "2025-2026"
UEFA_FIXTURES_URL = (
    "https://www.uefa.com/uefachampionsleague/news/"
    "029c-1e9a2f63fe2d-ebf9ad643892-1000--2025-26-champions-league-all-the-league-phase-fixtures/"
)
UEFA_POTS_URL = (
    "https://www.uefa.com/uefachampionsleague/news/"
    "029c-1e954c3512ef-8b9c6fa0f83b-1000--champions-league-league-phase-draw-pots-confirmed/"
)

_UEFA_POTS = (
    (
        "Paris Saint-Germain", "Real Madrid", "Manchester City", "Bayern München",
        "Liverpool", "Inter", "Chelsea", "Borussia Dortmund", "Barcelona",
    ),
    (
        "Arsenal", "Leverkusen", "Atlético de Madrid", "Benfica", "Atalanta",
        "Villarreal", "Juventus", "Frankfurt", "Club Brugge",
    ),
    (
        "Tottenham", "PSV Eindhoven", "Ajax", "Napoli", "Sporting CP", "Olympiacos",
        "Slavia Praha", "Bodø/Glimt", "Marseille",
    ),
    (
        "Copenhagen", "Monaco", "Galatasaray", "Union Saint-Gilloise", "Qarabağ",
        "Athletic Club", "Newcastle United", "Pafos", "Kairat Almaty",
    ),
)


def uefa_champions_pots() -> dict[str, int]:
    """Return the official UEFA 2025-26 league-phase draw pots."""
    return {
        club: pot
        for pot, clubs in enumerate(_UEFA_POTS, start=1)
        for club in clubs
    }
