import re
from app.schemas import ClassifyRequest, ClassifyResponse
from app.services.ollama_client import ollama
from app.utils.text import normalize


# Mots-clés déclencheurs (fallback déterministe)
CRITICAL_KEYWORDS = [
    "urgent", "critique", "grave", "dégât", "degat", "inondation",
    "effondrement", "explosion", "danger", "route", "école", "ecole",
    "hôpital", "hopital", "grande quantité", "grosse fuite", "jet",
    "cascade", "immeuble", "chaussée", "chaussee", "affaissement",
]

MEDIUM_KEYWORDS = [
    "fuite", "coule", "goutte", "trottoir", "rue", "voirie",
    "canalisation", "tuyau", "compteur", "vanne", "pression",
]


def _fallback_classify(req: ClassifyRequest) -> ClassifyResponse:
    """Classification par règles (utilisée si Ollama indisponible)."""
    text = normalize(f"{req.titre} {req.description}")

    critical_hits = sum(1 for kw in CRITICAL_KEYWORDS if kw in text)
    medium_hits = sum(1 for kw in MEDIUM_KEYWORDS if kw in text)

    if critical_hits > 0:
        gravite = "critique"
        score = min(1.0, 0.7 + critical_hits * 0.1)
        confiance = 0.75
        justification = f"Détection de {critical_hits} mot(s)-clé(s) critique(s)."
    elif medium_hits >= 2:
        gravite = "moyenne"
        score = 0.5
        confiance = 0.65
        justification = f"Détection de {medium_hits} indicateur(s) modéré(s)."
    else:
        gravite = "faible"
        score = 0.3
        confiance = 0.55
        justification = "Aucun indicateur critique détecté."

    return ClassifyResponse(
        gravite=gravite,
        score=score,
        confiance=confiance,
        justification=justification,
        source="fallback",
    )


def _parse_llm_response(text: str) -> dict:
    """Parse la réponse LLM pour extraire gravité, score, justification."""
    text_lower = text.lower()

    # Gravité
    if "critique" in text_lower:
        gravite = "critique"
    elif "moyenne" in text_lower or "moyen" in text_lower:
        gravite = "moyenne"
    else:
        gravite = "faible"

    # Score (cherche un nombre entre 0 et 1)
    score_match = re.search(r"0?\.\d+|\b[01](?:\.\d+)?\b", text)
    score = float(score_match.group()) if score_match else 0.5
    score = max(0.0, min(1.0, score))

    return {
        "gravite": gravite,
        "score": score,
        "justification": text[:300].strip(),
    }


async def classify(req: ClassifyRequest) -> ClassifyResponse:
    prompt = f"""Tu es un expert en gestion des fuites d'eau urbaines.
Analyse la réclamation suivante et classe sa gravité parmi : faible, moyenne, critique.

Titre : {req.titre}
Description : {req.description}
Adresse : {req.adresse or "Non renseignée"}
Zone : {req.zone or "Non renseignée"}

Critères :
- CRITIQUE : danger pour les personnes, dégâts importants, route/école/hôpital, fuite majeure
- MOYENNE : fuite visible, dégât limité, intervention nécessaire rapidement
- FAIBLE : goutte-à-goutte, pas d'urgence, entretien programmé

Réponds UNIQUEMENT au format :
GRAVITE: <faible|moyenne|critique>
SCORE: <nombre entre 0 et 1>
JUSTIFICATION: <une phrase courte>"""

    response = await ollama.generate(prompt, max_tokens=150)
    if not response:
        return _fallback_classify(req)

    parsed = _parse_llm_response(response)
    if parsed["gravite"] not in ("faible", "moyenne", "critique"):
        return _fallback_classify(req)

    return ClassifyResponse(
        gravite=parsed["gravite"],
        score=parsed["score"],
        confiance=0.85,
        justification=parsed["justification"],
        source="llm",
    )