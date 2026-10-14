import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "ollama_available" in data


def test_classify_critical():
    r = client.post("/classify", json={
        "titre": "Fuite urgente devant l'école",
        "description": "Une grosse fuite inonde la rue devant l'école primaire, danger pour les enfants.",
        "adresse": "12 Rue de l'École",
        "zone": "Centre",
    })
    assert r.status_code == 200
    data = r.json()
    assert data["gravite"] in ("faible", "moyenne", "critique")
    assert 0.0 <= data["score"] <= 1.0
    assert data["source"] in ("llm", "fallback")


def test_detect_duplicates():
    r = client.post("/detect-duplicates", json={
        "titre": "Fuite rue Principale",
        "description": "Une fuite d'eau importante au niveau du trottoir.",
        "adresse": "12 Rue Principale",
        "latitude": 36.8002,
        "longitude": 10.1803,
        "candidates": [
            {
                "id": 1,
                "reference": "REC-ABC",
                "titre": "Fuite rue Principale",
                "description": "Fuite d'eau au trottoir devant le numéro 12.",
                "adresse": "12 Rue Principale",
                "latitude": 36.8002,
                "longitude": 10.1803,
                "created_at": "2025-01-01T10:00:00",
            },
        ],
    })
    assert r.status_code == 200
    data = r.json()
    assert data["is_duplicate"] is True
    assert data["best_match_id"] == 1


def test_summarize():
    r = client.post("/summarize", json={
        "reference": "REC-XYZ",
        "titre": "Fuite sur canalisation principale",
        "description": "Une fuite importante au niveau de la canalisation principale provoque une inondation du trottoir.",
        "adresse": "5 Avenue Habib Bourguiba",
        "zone": "Centre",
        "gravite": "moyenne",
    })
    assert r.status_code == 200
    data = r.json()
    assert "resume" in data
    assert len(data["resume"]) > 10


def test_predict_recurrence():
    r = client.post("/predict-recurrence", json={
        "adresse": "12 Rue Principale",
        "latitude": 36.8002,
        "longitude": 10.1803,
        "history": [
            {
                "adresse": "12 Rue Principale",
                "latitude": 36.8002,
                "longitude": 10.1803,
                "created_at": "2025-01-01T10:00:00",
                "gravite": "moyenne",
            },
            {
                "adresse": "12 Rue Principale",
                "latitude": 36.8002,
                "longitude": 10.1803,
                "created_at": "2025-01-15T10:00:00",
                "gravite": "critique",
            },
        ],
    })
    assert r.status_code == 200
    data = r.json()
    assert data["occurrences_passees"] == 2
    assert 0.0 <= data["probabilite"] <= 1.0
    assert data["niveau_risque"] in ("faible", "moyen", "élevé")