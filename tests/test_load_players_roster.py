import unittest

from porra_champions.load_players_roster import catalogue_from_roster, parse_roster


class RosterImportTest(unittest.TestCase):
    def test_parses_teams_players_and_psv_alias(self):
        rows = parse_roster("## PSV\n- Ricardo Pepi\n\n## Atlético de Madrid\n- Julián Alvarez\n")
        self.assertEqual(rows, [
            {"team_name": "PSV Eindhoven", "full_name": "Ricardo Pepi"},
            {"team_name": "Atlético de Madrid", "full_name": "Julián Alvarez"},
        ])

    def test_catalogue_is_stable_and_traceable(self):
        rows = catalogue_from_roster("## Arsenal\n- Bukayo Saka\n", "roster.md", "2026-09-04T00:00:00+00:00")
        self.assertEqual(rows[0]["player_id"], "roster-2026:18f1349bc6ed59cd")
        self.assertEqual(rows[0]["source_provider"], "Roster proporcionado por la organización")
        self.assertEqual(rows[0]["source_url"], "roster.md")
