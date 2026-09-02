import unittest

from porra_mundial.champions import (
    CHAMPIONS_LEAGUE_ID,
    CHAMPIONS_SEASON,
    UEFA_FIXTURES_URL,
    UEFA_POTS_URL,
    parse_uefa_fixture_html,
    uefa_champions_pots,
)


class ChampionsCatalogTests(unittest.TestCase):
    def test_official_uefa_pots_cover_36_clubs_in_four_pots(self):
        pots = uefa_champions_pots()

        self.assertEqual(CHAMPIONS_LEAGUE_ID, "4480")
        self.assertEqual(CHAMPIONS_SEASON, "2026-2027")
        self.assertTrue(UEFA_FIXTURES_URL.startswith("https://www.uefa.com/"))
        self.assertTrue(UEFA_POTS_URL.startswith("https://www.uefa.com/"))
        self.assertEqual(len(pots), 36)
        self.assertEqual({pot for pot in pots.values()}, {1, 2, 3, 4})
        self.assertEqual([list(pots.values()).count(pot) for pot in range(1, 5)], [9, 9, 9, 9])
        self.assertEqual(pots["Paris Saint-Germain"], 1)
        self.assertEqual(pots["Sabah"], 4)

    def test_parser_keeps_league_and_knockout_matches_with_uefa_ids(self):
        html = """
        <h2><b>League phase results</b></h2><h3><b>Matchday 1</b></h3>
        <p><b>Tuesday 16 September 2025</b><br/>
        <a href="https://www.uefa.com/uefachampionsleague/match/2046001--athletic-club-vs-arsenal/">Athletic Club 0-2 Arsenal</a></p>
        <h2><b>Round of 16 results</b></h2><h3><b>First legs</b></h3>
        <p><b>Tuesday 10 March</b><br/>
        <a href="https://www.uefa.com/uefachampionsleague/match/2046101--galatasaray-vs-liverpool/">Galatasaray 1-0 Liverpool</a></p>
        <h2><b>Qualifying</b></h2><p><b>Tuesday 8 July 2025</b><br/>
        <a href="https://www.uefa.com/uefachampionsleague/match/1--kups-vs-milsami/">KuPS 1-0 Milsami</a></p>
        """

        matches = parse_uefa_fixture_html(html)

        self.assertEqual(len(matches), 2)
        self.assertEqual(matches[0]["matchid"], 2046001)
        self.assertEqual(matches[0]["ronda"], "J01")
        self.assertEqual(matches[0]["fecha"], "16.09.2025")
        self.assertEqual(matches[1]["ronda"], "R16")
        self.assertEqual(matches[1]["fecha"], "10.03.2026")

    def test_parser_normalizes_uefa_short_club_names(self):
        html = """
        <h2><b>League phase results</b></h2><h3><b>Matchday 1</b></h3>
        <p><b>Tuesday 16 September 2025</b><br/>
        <a href="https://www.uefa.com/uefachampionsleague/match/2046002--paris-vs-man-city/">Paris 2-1 Man City</a></p>
        """

        match = parse_uefa_fixture_html(html)[0]

        self.assertEqual(match["home_team"], "Paris Saint-Germain")
        self.assertEqual(match["away_team"], "Manchester City")


if __name__ == "__main__":
    unittest.main()
