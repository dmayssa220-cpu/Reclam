from datetime import datetime, timedelta
from app.schemas import RecurrenceRequest, RecurrenceResponse
from app.utils.geo import haversine_km
from app.config import get_settings

settings = get_settings()


async def predict_recurrence(req: RecurrenceRequest) -> RecurrenceResponse:
    """Prédit la probabilité de récurrence basée sur l'historique."""
    if not req.history:
        return RecurrenceResponse(
            probabilite=0.0,
            niveau_risque="faible",
            occurrences_passees=0,
            derniere_occurrence=None,
            justification="Aucun historique disponible.",
        )

    now = datetime.now()
    matching: list = []

    for item in req.history:
        # Match par adresse
        if req.adresse and item.adresse:
            # Simplifié : comparaison directe normalisée
            if req.adresse.lower().strip() == item.adresse.lower().strip():
                matching.append(item)
                continue

        # Match par GPS
        if req.latitude and req.longitude and item.latitude and item.longitude:
            dist = haversine_km(
                req.latitude, req.longitude,
                item.latitude, item.longitude,
            )
            if dist <= settings.duplicate_geo_radius_km:
                matching.append(item)

    occurrences = len(matching)

    if occurrences == 0:
        return RecurrenceResponse(
            probabilite=0.05,
            niveau_risque="faible",
            occurrences_passees=0,
            derniere_occurrence=None,
            justification="Aucune occurrence passée détectée à cet emplacement.",
        )

    occurrence_score = min(1.0, occurrences / 5.0)  # 5+ occurrences = 1.0

    # Récence
    dates = []
    for m in matching:
        try:
            dates.append(datetime.fromisoformat(m.created_at.replace("Z", "+00:00")))
        except (ValueError, AttributeError):
            continue

    recency_score = 0.0
    derniere = None
    if dates:
        derniere_dt = max(dates)
        derniere = derniere_dt.isoformat()
        days_ago = (now - derniere_dt.replace(tzinfo=None)).days
        if days_ago <= 30:
            recency_score = 1.0
        elif days_ago <= 90:
            recency_score = 0.7
        elif days_ago <= 180:
            recency_score = 0.4
        else:
            recency_score = 0.2

    # Gravité passée
    gravite_score = 0.0
    for m in matching:
        if m.gravite == "critique":
            gravite_score = max(gravite_score, 1.0)
        elif m.gravite == "moyenne":
            gravite_score = max(gravite_score, 0.6)
        else:
            gravite_score = max(gravite_score, 0.3)

    # Score final pondéré
    probabilite = (
        occurrence_score * 0.45
        + recency_score * 0.30
        + gravite_score * 0.25
    )
    probabilite = round(min(1.0, probabilite), 4)

    # Niveau
    if probabilite >= 0.7:
        niveau = "élevé"
    elif probabilite >= 0.4:
        niveau = "moyen"
    else:
        niveau = "faible"

    justification = (
        f"{occurrences} occurrence(s) passée(s) à cet emplacement. "
        f"Dernière : {derniere[:10] if derniere else 'inconnue'}."
    )

    return RecurrenceResponse(
        probabilite=probabilite,
        niveau_risque=niveau,
        occurrences_passees=occurrences,
        derniere_occurrence=derniere,
        justification=justification,
    )