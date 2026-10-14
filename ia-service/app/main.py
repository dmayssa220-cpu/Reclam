from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from app.schemas import (
    ClassifyRequest, ClassifyResponse,
    DuplicateRequest, DuplicateResponse,
    SummarizeRequest, SummarizeResponse,
    RecurrenceRequest, RecurrenceResponse,
    HealthResponse,
)
from app.services.classifier import classify
from app.services.duplicate_detector import detect_duplicates
from app.services.summarizer import summarize
from app.services.recurrence_predictor import predict_recurrence
from app.services.ollama_client import ollama
from app.config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Water Leaks IA Service",
    description="Microservice IA pour la gestion des fuites d'eau",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Health check
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health():
    ollama_ok = await ollama.is_available()
    return HealthResponse(
        status="ok",
        ollama_available=ollama_ok,
        model=settings.ollama_model,
        version="1.0.0",
    )



@app.post("/classify", response_model=ClassifyResponse)
async def classify_endpoint(req: ClassifyRequest):
    try:
        return await classify(req)
    except Exception as e:
        logger.error(f"Erreur classify: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-duplicates", response_model=DuplicateResponse)
async def detect_duplicates_endpoint(req: DuplicateRequest):
    try:
        return await detect_duplicates(req)
    except Exception as e:
        logger.error(f"Erreur detect_duplicates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(req: SummarizeRequest):
    try:
        return await summarize(req)
    except Exception as e:
        logger.error(f"Erreur summarize: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/predict-recurrence", response_model=RecurrenceResponse)
async def predict_recurrence_endpoint(req: RecurrenceRequest):
    try:
        return await predict_recurrence(req)
    except Exception as e:
        logger.error(f"Erreur predict_recurrence: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Démarrage du service IA Water Leaks")
    available = await ollama.is_available()
    logger.info(f"Ollama disponible : {available}")