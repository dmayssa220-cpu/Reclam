from app.schemas import DuplicateRequest, DuplicateResponse, DuplicateMatch
from app.utils.text import similarity
from app.utils.geo import haversine_km
from app.config import get_settings

settings = get_settings()


def _score_match(req: DuplicateRequest, cand) -> tuple[float, str]:
    """Score composite : texte + adresse + proximité GPS."""
    raisons = []

    # 1) Similarité texte (titre + description)
    text_new = f"{req.titre} {req.description}"
    text_cand = f"{cand.titre} {cand.description}"
    text_score = similarity(text_new, text_cand)

    # 2) Similarité adresse
    address_score = 0.0
    if req.adresse and cand.adresse:
        address_score = similarity(req.adresse, cand.adresse)

    # 3) Proximité GPS
    geo_score = 0.0
    distance_km = None
    if req.latitude and req.longitude and cand.latitude and cand.longitude:
        distance_km = haversine_km(
            req.latitude, req.longitude,
            cand.latitude, cand.longitude,
        )
        if distance_km <= settings.duplicate_geo_radius_km:
            geo_score = 1.0 - (distance_km / settings.duplicate_geo_radius_km)
        geo_score = max(0.0, geo_score)

    # Score composite pondéré
    final = (
        text_score * 0.50
        + address_score * 0.30
        + geo_score * 0.20
    )

    # Justifications
    if text_score > 0.7:
        raisons.append("Description très similaire")
    if address_score > 0.8:
        raisons.append("Même adresse")
    if distance_km is not None and distance_km < 0.1:
        raisons.append(f"Distance : {int(distance_km * 1000)} m")
    elif distance_km is not None and distance_km < settings.duplicate_geo_radius_km:
        raisons.append(f"Proximité : {distance_km:.2f} km")

    return round(final, 4), " · ".join(raisons) or "Similarité détectée"


async def detect_duplicates(req: DuplicateRequest) -> DuplicateResponse:
    if not req.candidates:
        return DuplicateResponse(is_duplicate=False, matches=[])

    matches: list[DuplicateMatch] = []

    for cand in req.candidates:
        score, raison = _score_match(req, cand)
        if score >= settings.duplicate_threshold:
            matches.append(DuplicateMatch(
                id=cand.id,
                reference=cand.reference,
                score=score,
                raison=raison,
            ))

    matches.sort(key=lambda m: -m.score)

    return DuplicateResponse(
        is_duplicate=len(matches) > 0,
        matches=matches[:5],
        best_match_id=matches[0].id if matches else None,
    )