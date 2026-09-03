import unittest
from porra_champions.players import catalogue_rows, normalize_player_name


class PlayersTest(unittest.TestCase):
    def test_normalizes_accents_and_punctuation(self):
        self.assertEqual(normalize_player_name("Kylian Mbappé-Lottin"), "kylian mbappe lottin")

    def test_requires_uefa_traceability(self):
        with self.assertRaises(ValueError):
            catalogue_rows([{"full_name": "Jugador"}])

    def test_builds_auditable_row(self):
        row = catalogue_rows([{"player_id":"uefa:1","team_id":"1","team_name":"Real Madrid","full_name":"Kylian Mbappé","source_url":"https://uefa.example/squad"}], "2026-09-03T00:00:00+00:00")[0]
        self.assertEqual(row["normalized_name"], "kylian mbappe")
        self.assertEqual(row["source_provider"], "UEFA")
