from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ClassifyRequest(BaseModel):
    titre: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=5, max_length=5000)
    adresse: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ClassifyResponse(BaseModel):
    gravite: str
    score: float
    confiance: float
    justification: str
    source: str

class DuplicateCandidate(BaseModel):
    id: int
    reference: str
    titre: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    adresse: Optional[str] = None
    created_at: str


class DuplicateRequest(BaseModel):
    titre: str
    description: str
    adresse: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    candidates: List[DuplicateCandidate] = []


class DuplicateMatch(BaseModel):
    id: int
    reference: str
    score: float                     # 0.0 - 1.0
    raison: str


class DuplicateResponse(BaseModel):
    is_duplicate: bool
    matches: List[DuplicateMatch]
    best_match_id: Optional[int] = None


# ============================================
# Résumé
# ============================================

class SummarizeRequest(BaseModel):
    reference: str
    titre: str
    description: str
    adresse: Optional[str] = None
    zone: Optional[str] = None
    gravite: Optional[str] = None


class SummarizeResponse(BaseModel):
    resume: str
    points_cles: List[str]


# ============================================
# Prédiction de récurrence
# ============================================

class RecurrenceHistoryPoint(BaseModel):
    adresse: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: str
    gravite: str


class RecurrenceRequest(BaseModel):
    adresse: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    history: List[RecurrenceHistoryPoint] = []


class RecurrenceResponse(BaseModel):
    probabilite: float               # 0.0 - 1.0
    niveau_risque: str               # faible | moyen | élevé
    occurrences_passees: int
    derniere_occurrence: Optional[str] = None
    justification: str


# ============================================
# Santé
# ============================================

class HealthResponse(BaseModel):
    status: str
    ollama_available: bool
    model: str
    version: str