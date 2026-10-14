from app.schemas import SummarizeRequest, SummarizeResponse
from app.services.ollama_client import ollama
from app.utils.text import extract_keywords


def _fallback_summary(req: SummarizeRequest) -> SummarizeResponse:
    """Résumé par extraction si LLM indisponible."""
    description = req.description.strip()
    first_sentence = description.split(".")[0][:200] + "." if description else ""

    keywords = extract_keywords(f"{req.titre} {req.description}", max_words=5)

    resume = (
        f"Réclamation {req.reference} : {req.titre}. "
        f"{first_sentence}"
    ).strip()

    points = []
    if req.adresse:
        points.append(f"📍 {req.adresse}")
    if req.zone:
        points.append(f"🗺️ Zone : {req.zone}")
    if req.gravite:
        points.append(f"⚠️ Gravité : {req.gravite}")
    if keywords:
        points.append(f"🔑 Mots-clés : {', '.join(keywords)}")

    return SummarizeResponse(resume=resume[:400], points_cles=points)


async def summarize(req: SummarizeRequest) -> SummarizeResponse:
    prompt = f"""Résume cette réclamation en 2 phrases maximum, puis liste 3 points clés.

Titre : {req.titre}
Description : {req.description}
Adresse : {req.adresse or "Non renseignée"}
Zone : {req.zone or "Non renseignée"}
Gravité : {req.gravite or "Non qualifiée"}

Format attendu :
RESUME: <2 phrases>
POINT: <point 1>
POINT: <point 2>
POINT: <point 3>"""

    response = await ollama.generate(prompt, max_tokens=250)
    if not response:
        return _fallback_summary(req)

    # Parse
    resume_lines = []
    points = []
    for line in response.split("\n"):
        line = line.strip()
        if line.upper().startswith("RESUME:"):
            resume_lines.append(line[7:].strip())
        elif line.upper().startswith("POINT:"):
            points.append(line[6:].strip())

    resume = " ".join(resume_lines).strip() or response[:300]

    if not points:
        return _fallback_summary(req)

    return SummarizeResponse(resume=resume[:400], points_cles=points[:5])