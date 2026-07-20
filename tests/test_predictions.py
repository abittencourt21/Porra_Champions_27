import unittest

from porra_mundial.models import Match
from porra_mundial.predictions import build_prediction_windows, prediction_points, score_predictions


class PredictionsTests(unittest.TestCase):
    def test_prediction_points_returns_exact_result_or_quiniela(self):
        self.assertEqual(prediction_points(2, 1, 2, 1), 3)
        self.assertEqual(prediction_points(2, 1, 1, 0), 1)
        self.assertEqual(prediction_points(2, 1, 0, 2), 0)

    def test_build_prediction_windows_uses_monday_to_tuesday_window(self):
        matches = [
            Match(
                matchid=1,
                group="A",
                roundnumber=1,
                ronda="grupos",
                fecha="11.06.2026",
                home_team="Equipo A",
                away_team="Equipo B",
            ),
            Match(
                matchid=2,
                group="A",
                roundnumber=2,
                ronda="grupos",
                fecha="12.06.2026",
                home_team="Equipo C",
                away_team="Equipo D",
            ),
        ]

        windows = build_prediction_windows(matches)

        self.assertEqual(len(windows), 2)
        self.assertEqual(windows[0]["window_id"], "2026-06-08-grupos")
        self.assertEqual(windows[0]["opens_at"], "2026-06-08")
        self.assertEqual(windows[0]["closes_at"], "2026-06-09")
        self.assertEqual(windows[0]["matchids"], [1])

    def test_score_predictions_aggregates_exact_results_and_quinielas(self):
        predictions = [
            {"matchid": 1, "home_score": 2, "away_score": 1},
            {"matchid": 2, "home_score": 0, "away_score": 0},
        ]
        matches = [
            Match(
                matchid=1,
                group="A",
                roundnumber=1,
                ronda="grupos",
                fecha="11.06.2026",
                home_team="Equipo A",
                away_team="Equipo B",
                home_score=2,
                away_score=1,
                status="FT",
            ),
            Match(
                matchid=2,
                group="A",
                roundnumber=2,
                ronda="grupos",
                fecha="12.06.2026",
                home_team="Equipo C",
                away_team="Equipo D",
                home_score=1,
                away_score=0,
                status="FT",
            ),
        ]

        summary = score_predictions(predictions, matches)

        self.assertEqual(summary["puntos_totales"], 4)
        self.assertEqual(summary["partidos_evaluados"], 2)
        self.assertEqual(summary["detalles"][0]["puntos"], 3)
        self.assertEqual(summary["detalles"][1]["puntos"], 1)


if __name__ == "__main__":
    unittest.main()
