# Implementation progress — Historical Champions seed

## T001 — 2026-07-20

- status: complete
- red: `tests.test_champions` failed because `porra_mundial.champions` did not exist (after repairing a pre-existing dataclass field-order import error exposed by Python 3.12).
- green: `tests.test_champions` passed with 36 clubs split into four official UEFA pots.
- triangulation: asserts both a pot-one and a pot-four club plus 9 clubs per pot.
- files: `src/porra_mundial/models.py`, `src/porra_mundial/champions.py`, `tests/test_champions.py`
- decision: UEFA source URLs are constants alongside the official pot catalogue; fixture/result parsing remains the next task.
- blocker: none
