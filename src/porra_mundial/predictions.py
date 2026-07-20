from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Iterable

from .models import Match


def normalize_email(value: str | None) -> str:
    return (value or "").strip().casefold()


def prediction_points(predicted_home: int | None, predicted_away: int | None, actual_home: int | None, actual_away: int | None) -> int:
    if predicted_home is None or predicted_away is None or actual_home is None or actual_away is None:
        return 0
    if predicted_home == actual_home and predicted_away == actual_away:
        return 3
    if (predicted_home > predicted_away and actual_home > actual_away) or (predicted_home < predicted_away and actual_home < actual_away) or (predicted_home == predicted_away and actual_home == actual_away):
        return 1
    return 0


def can_edit_prediction(match: Match) -> bool:
    return (match.home_score is None and match.away_score is None and str(match.status or "").upper() in {"NS", "", "TBD"})


def build_prediction_windows(matches: Iterable[Match]) -> list[dict[str, Any]]:
    ordered_matches = sorted(matches, key=lambda match: (match.fecha, match.matchid))
    windows: list[dict[str, Any]] = []
    for match in ordered_matches:
        match_date = _parse_date(match.fecha)
        if match_date is None:
            continue
        window_start = match_date - timedelta(days=3)
        window_end = match_date - timedelta(days=2)
        windows.append(
            {
                "window_id": f"{window_start.date().isoformat()}-{match.ronda}",
                "opens_at": window_start.date().isoformat(),
                "closes_at": window_end.date().isoformat(),
                "matchids": [match.matchid],
                "matches": [match.to_dict()],
            }
        )
    return windows


def deduplicate_profiles(profiles: Iterable[dict[str, Any]] | None) -> list[dict[str, Any]]:
    by_email: dict[str, dict[str, Any]] = {}
    for profile in profiles or []:
        email = normalize_email(profile.get("email") or profile.get("user_email") or "")
        if not email:
            continue
        existing = by_email.setdefault(
            email,
            {
                "email": email,
                "alias": profile.get("alias") or profile.get("name") or email,
                "predictions": [],
                "updated_at": profile.get("updated_at") or "",
            },
        )
        alias = profile.get("alias") or profile.get("name") or existing.get("alias") or email
        existing["alias"] = alias
        existing["updated_at"] = _latest_timestamp(existing.get("updated_at"), profile.get("updated_at"))
        existing["predictions"] = _merge_prediction_rows(existing.get("predictions", []), _prediction_rows(profile))
    return list(by_email.values())


def build_prediction_payload(profiles: Iterable[dict[str, Any]] | None, matches: Iterable[Match]) -> dict[str, Any]:
    parsed_matches = [match if isinstance(match, Match) else Match.from_dict(match) for match in matches]
    match_index = {match.matchid: match for match in parsed_matches if match.matchid}
    normalized_profiles = deduplicate_profiles(profiles)
    payload_profiles: list[dict[str, Any]] = []
    for profile in normalized_profiles:
        predictions = []
        for prediction in profile.get("predictions", []) or []:
            match = match_index.get(int(prediction.get("matchid", 0)))
            if match is None:
                continue
            predictions.append(
                {
                    "matchid": match.matchid,
                    "home_team": match.home_team,
                    "away_team": match.away_team,
                    "home_score": prediction.get("home_score"),
                    "away_score": prediction.get("away_score"),
                    "updated_at": prediction.get("updated_at") or profile.get("updated_at") or "",
                    "editable": can_edit_prediction(match),
                }
            )
        payload_profiles.append(
            {
                "email": profile["email"],
                "alias": profile.get("alias") or profile["email"],
                "updated_at": profile.get("updated_at") or "",
                "predictions": predictions,
            }
        )
    return {
        "profiles": payload_profiles,
        "windows": build_prediction_windows(parsed_matches),
    }


def score_predictions(predictions: Iterable[dict[str, Any]], matches: Iterable[Match]) -> dict[str, Any]:
    match_index = {match.matchid: match for match in matches if match.matchid}
    details: list[dict[str, Any]] = []
    for prediction in predictions:
        match = match_index.get(int(prediction.get("matchid", 0)))
        if match is None:
            continue
        points = prediction_points(
            int(prediction.get("home_score", 0) or 0),
            int(prediction.get("away_score", 0) or 0),
            match.home_score,
            match.away_score,
        )
        details.append(
            {
                "matchid": match.matchid,
                "home_team": match.home_team,
                "away_team": match.away_team,
                "prediction": {
                    "home_score": prediction.get("home_score"),
                    "away_score": prediction.get("away_score"),
                },
                "actual": {
                    "home_score": match.home_score,
                    "away_score": match.away_score,
                },
                "puntos": points,
            }
        )
    return {
        "puntos_totales": sum(item["puntos"] for item in details),
        "partidos_evaluados": len(details),
        "detalles": details,
    }


def _prediction_rows(profile: dict[str, Any]) -> list[dict[str, Any]]:
    rows = profile.get("predictions") or profile.get("picks") or []
    return [row for row in rows if isinstance(row, dict)]


def _merge_prediction_rows(existing_rows: list[dict[str, Any]], incoming_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[int, dict[str, Any]] = {}
    for row in existing_rows + incoming_rows:
        matchid = int(row.get("matchid", 0))
        if not matchid:
            continue
        existing_row = merged.get(matchid)
        if existing_row is None:
            merged[matchid] = dict(row)
            continue
        merged[matchid] = {
            **existing_row,
            **row,
            "updated_at": _latest_timestamp(existing_row.get("updated_at"), row.get("updated_at")),
        }
    return list(merged.values())


def _latest_timestamp(left: Any, right: Any) -> str:
    left_value = str(left or "")
    right_value = str(right or "")
    if not left_value:
        return right_value
    if not right_value:
        return left_value
    return left_value if left_value >= right_value else right_value


def _parse_date(value: str | None):
    if not value:
        return None
    try:
        day, month, year = value.split(".")
        return datetime(int(year), int(month), int(day))
    except ValueError:
        return None
