from __future__ import annotations

from typing import Any


def make_user_identity(email: str, alias: str | None = None) -> dict[str, Any]:
    normalized_email = (email or "").strip().casefold()
    return {
        "user_id": _stable_user_id(normalized_email),
        "email": normalized_email,
        "alias": (alias or normalized_email).strip(),
    }


def _stable_user_id(email: str) -> str:
    return f"user::{email}"
