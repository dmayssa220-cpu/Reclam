import httpx
from typing import Optional
from app.config import get_settings

settings = get_settings()


class OllamaClient:
    """Client HTTP simple vers Ollama."""

    def __init__(self):
        self.url = settings.ollama_url
        self.model = settings.ollama_model
        self.timeout = settings.ollama_timeout

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(f"{self.url}/api/tags")
                return r.status_code == 200
        except Exception:
            return False

    async def generate(self, prompt: str, max_tokens: int = 200) -> Optional[str]:
        """Appelle /api/generate et renvoie le texte brut."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.post(
                    f"{self.url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.2,
                            "num_predict": max_tokens,
                        },
                    },
                )
                if r.status_code != 200:
                    return None
                data = r.json()
                return data.get("response", "").strip()
        except Exception:
            return None


ollama = OllamaClient()