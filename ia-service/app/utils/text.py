import re
from rapidfuzz import fuzz


def normalize(text: str) -> str:
    """Normalise un texte pour comparaison (lowercase, sans accents/ponctuation)."""
    if not text:
        return ""
    text = text.lower().strip()
    # Retire les accents
    replacements = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'î': 'i', 'ï': 'i', 'í': 'i',
        'ô': 'o', 'ö': 'o', 'ó': 'o',
        'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
        'ç': 'c', 'ñ': 'n',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Retire la ponctuation
    text = re.sub(r"[^\w\s]", " ", text)
    # Espaces multiples
    text = re.sub(r"\s+", " ", text).strip()
    return text


def similarity(a: str, b: str) -> float:
    """Similarité entre deux textes (0-1) via plusieurs métriques."""
    a_norm = normalize(a)
    b_norm = normalize(b)
    if not a_norm or not b_norm:
        return 0.0

    # Combine token_set_ratio et partial_ratio pour robustesse
    token_score = fuzz.token_set_ratio(a_norm, b_norm) / 100.0
    partial_score = fuzz.partial_ratio(a_norm, b_norm) / 100.0

    return round((token_score * 0.7 + partial_score * 0.3), 4)


def extract_keywords(text: str, max_words: int = 5) -> list[str]:
    """Extrait les mots-clés (mots de plus de 3 lettres, hors stopwords)."""
    stopwords = {
        "avec", "dans", "pour", "sans", "sous", "vers", "chez", "cette",
        "elle", "nous", "vous", "elles", "ils", "leur", "mais", "donc",
        "car", "est", "sont", "les", "des", "une", "aux", "que", "qui",
        "tout", "plus", "très", "bien", "fait", "sur", "par", "aux",
    }
    words = normalize(text).split()
    keywords = [
        w for w in words
        if len(w) > 3 and w not in stopwords
    ]
    # Fréquence
    freq: dict[str, int] = {}
    for w in keywords:
        freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: -x[1])
    return [w for w, _ in sorted_words[:max_words]]