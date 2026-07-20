import unittest

from porra_mundial.champions import (
    CHAMPIONS_LEAGUE_ID,
    CHAMPIONS_SEASON,
    UEFA_FIXTURES_URL,
    UEFA_POTS_URL,
    uefa_champions_pots,
)


class ChampionsCatalogTests(unittest.TestCase):
    def test_official_uefa_pots_cover_36_clubs_in_four_pots(self):
        pots = uefa_champions_pots()

        self.assertEqual(CHAMPIONS_LEAGUE_ID, "4480")
        self.assertEqual(CHAMPIONS_SEASON, "2025-2026")
        self.assertTrue(UEFA_FIXTURES_URL.startswith("https://www.uefa.com/"))
        self.assertTrue(UEFA_POTS_URL.startswith("https://www.uefa.com/"))
        self.assertEqual(len(pots), 36)
        self.assertEqual({pot for pot in pots.values()}, {1, 2, 3, 4})
        self.assertEqual([list(pots.values()).count(pot) for pot in range(1, 5)], [9, 9, 9, 9])
        self.assertEqual(pots["Paris Saint-Germain"], 1)
        self.assertEqual(pots["Kairat Almaty"], 4)


if __name__ == "__main__":
    unittest.main()
