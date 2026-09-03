"""Validated, auditable UEFA player catalogue helpers."""
from __future__ import annotations

import re
import unicodedata
from datetime import datetime, timezone
from typing import Any, Iterable


def normalize_player_name(value: str) -> str:
    value = unicodedata.normalize("NFD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", value.lower())).strip()


def catalogue_rows(raw: Iterable[dict[str, Any]], captured_at: str | None = None) -> list[dict[str, Any]]:
    captured_at = captured_at or datetime.now(timezone.utc).isoformat()
    rows: list[dict[str, Any]] = []
    for item in raw:
        required = ("player_id", "team_id", "team_name", "full_name", "source_url")
        if not all(str(item.get(key, "")).strip() for key in required):
            raise ValueError("UEFA player row is missing a required source field")
        rows.append({
            "player_id": str(item["player_id"]), "season": "2026-2027", "competition": "UCL",
            "team_id": str(item["team_id"]), "team_name": str(item["team_name"]), "full_name": str(item["full_name"]),
            "normalized_name": normalize_player_name(str(item["full_name"])), "position": item.get("position"),
            "shirt_number": item.get("shirt_number"), "uefa_list_type": item.get("uefa_list_type", "A"),
            "source_provider": "UEFA", "source_url": str(item["source_url"]),
            "source_updated_at": item.get("source_updated_at", captured_at), "active": bool(item.get("active", True)),
        })
    return rows
