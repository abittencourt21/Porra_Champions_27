# Project constitution — Porra Champions

Version: v1.0.0  
Ratified: 2026-07-20  
Last amended: 2026-07-20

## Principles

1. **Python and static web remain the delivery stack.** Domain logic lives under `src/`, browser presentation under `public/`, and published data is generated JSON. Any new runtime dependency must be declared in `pyproject.toml`.
2. **Real tournament data is traceable.** Every generated tournament dataset identifies its competition, season, provider, source reference and capture time. Unknown source fields stay unknown and emit an alert; they are never invented.
3. **Tests precede behavioural changes.** A changed parser, scoring rule or build path requires a focused failing regression test before implementation and the full unit suite must pass before delivery.
4. **Published data protects participants.** Public output must not reveal real names, emails, credentials or unapproved source secrets. Credentials stay in environment variables or repository secrets.
5. **The static web is data-driven.** Tournament teams, pots, stages and labels shown to users must come from the published data contract rather than a hard-coded, tournament-specific browser matrix.
6. **Changes are isolated and reviewable.** Feature work is performed on a named feature branch/worktree, verification runs the documented test and data-build commands, and a review examines spec fidelity and source-data edge cases.
7. **Git authorship is human and decisions persist.** Commits and pull requests have no AI co-author/footer; significant decisions are appended to `02-DOCS/wiki/sdd/decisions.md`.

## Definition of done

- Relevant unit tests were red before the behavioural implementation and are green after it.
- `$env:PYTHONPATH = 'src'; python -m unittest discover -s tests` exits 0.
- `$env:PYTHONPATH = 'src'; python -m porra_champions.build_data --out public/datos.json` exits 0.
- Generated output satisfies the approved acceptance criteria and includes traceable source metadata.
- The diff has passed an evidence-backed review and contains no secrets or personal data.

## Amendment log

- 2026-07-20 — v1.0.0 created from the observable repository stack, privacy requirements and approved historical-Champions feature. The user enabled SDD autopilot for this delivery.
