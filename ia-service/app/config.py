from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Ollama
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "phi3:mini"
    ollama_timeout: int = 30

    # Seuils
    duplicate_threshold: float = 0.75
    duplicate_geo_radius_km: float = 0.3
    duplicate_days_window: int = 90

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8001

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()