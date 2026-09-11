import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEASON_DIR = ROOT / "data" / "champions-2026-27"


class RepositoryHygieneTests(unittest.TestCase):
    def test_season_data_has_one_portable_source_of_truth(self):
        self.assertFalse((ROOT / "data" / "seed.json").exists())
        seed = json.loads((SEASON_DIR / "seed.json").read_text(encoding="utf-8"))
        self.assertEqual(len(seed["bombos"]), 36)
        self.assertEqual(len(seed["partidos"]), 144)
        self.assertTrue(all(match.get("starts_at") for match in seed["partidos"]))
        source_reference = seed["meta"]["source_sportsdb_csv"]
        self.assertFalse(Path(source_reference).is_absolute())
        self.assertNotRegex(source_reference, r"^[A-Za-z]:[\\/]")

    def test_manifest_describes_the_active_official_dataset(self):
        manifest = json.loads((SEASON_DIR / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["status"], "active")
        self.assertTrue(manifest["source_uefa_pots_url"])
        self.assertTrue(manifest["source_uefa_fixtures_url"])

    def test_world_cup_product_artifacts_are_not_published(self):
        for relative_path in (
            "bombos.csv",
            "data/overrides_template.csv",
            "docs/archive/FIFA-World-Cup-26-Logo-Vector-730x730.jpg",
            "docs/archive/world-cup-2026-hero.svg",
            "docs/archive/porra_mundial_2026_spec_v2.md",
        ):
            self.assertFalse((ROOT / relative_path).exists(), relative_path)

        app = (ROOT / "public" / "app.js").read_text(encoding="utf-8")
        self.assertNotIn("renderRulesLegacy", app)
        self.assertNotIn("Estados Unidos", app)
        self.assertNotIn("Legacy local demo", app)

    def test_public_documentation_matches_the_live_rules(self):
        rules = (ROOT / "REGLAS_PARTICIPANTES.md").read_text(encoding="utf-8")
        self.assertIn("60%", rules)
        self.assertIn("Premio Quinielista", rules)
        self.assertIn("J1", rules)
        self.assertNotIn("80%", rules)
        self.assertNotIn("puede recogerse", rules)

    def test_ci_covers_python_javascript_and_deterministic_build(self):
        ci = (ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
        self.assertIn("python -m unittest discover -s tests", ci)
        self.assertIn("node --test", ci)
        self.assertIn("PREVIOUS_DATOS_URL", ci)
        self.assertIn("BUILD_DATE", ci)
        self.assertIsNone(re.search(r"secrets\.", ci))

    def test_deploy_uses_node_24_actions_and_does_not_try_to_enable_pages(self):
        workflow = (ROOT / ".github" / "workflows" / "deploy-pages.yml").read_text(encoding="utf-8")
        self.assertIn("actions/checkout@v7", workflow)
        self.assertIn("actions/setup-python@v7", workflow)
        self.assertIn("actions/setup-node@v6", workflow)
        self.assertIn("actions/upload-artifact@v7", workflow)
        self.assertIn("actions/download-artifact@v7", workflow)
        self.assertIn("actions/configure-pages@v6", workflow)
        self.assertIn("actions/deploy-pages@v5", workflow)
        self.assertNotIn("enablement:", workflow)
        self.assertNotIn("actions/upload-pages-artifact", workflow)


if __name__ == "__main__":
    unittest.main()
