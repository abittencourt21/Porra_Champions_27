import unittest
from pathlib import Path, PurePosixPath

from porra_champions.import_champions_csv import portable_source_reference


class ImportChampionsCsvTests(unittest.TestCase):
    def test_source_reference_does_not_publish_the_local_directory(self):
        path = Path(r"C:\Users\organizer\Downloads\csv_matches_sportsdb.txt")

        self.assertEqual(
            portable_source_reference(path),
            "sources/csv_matches_sportsdb.txt",
        )

    def test_windows_source_reference_is_portable_on_a_posix_runner(self):
        path = PurePosixPath(r"C:\Users\organizer\Downloads\csv_matches_sportsdb.txt")

        self.assertEqual(
            portable_source_reference(path),
            "sources/csv_matches_sportsdb.txt",
        )


if __name__ == "__main__":
    unittest.main()
