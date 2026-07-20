import unittest

from porra_mundial.season_manifest import validate_manifest_for_capture


class SeasonManifestTests(unittest.TestCase):
    def test_rejects_manifest_without_official_uefa_sources(self):
        with self.assertRaisesRegex(ValueError, "source_uefa_pots_url"):
            validate_manifest_for_capture(
                {"competition": "UEFA Champions League", "season": "2026-2027"}
            )

    def test_accepts_manifest_with_both_official_uefa_sources(self):
        validate_manifest_for_capture(
            {
                "competition": "UEFA Champions League",
                "season": "2026-2027",
                "source_uefa_pots_url": "https://www.uefa.com/pots",
                "source_uefa_fixtures_url": "https://www.uefa.com/fixtures",
            }
        )
