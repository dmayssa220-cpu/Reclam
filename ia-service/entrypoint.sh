#!/bin/bash
set -e

echo "🚀 Démarrage d'Ollama..."
ollama serve &
OLLAMA_PID=$!

# Attendre que Ollama soit prêt
echo "⏳ Attente d'Ollama..."
for i in {1..30}; do
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama prêt"
    break
  fi
  sleep 1
done

MODEL="${OLLAMA_MODEL:-phi3:mini}"
if ! ollama list | grep -q "$MODEL"; then
  echo "📥 Téléchargement du modèle $MODEL (cela peut prendre quelques minutes)..."
  ollama pull "$MODEL" || echo "⚠️ Impossible de télécharger le modèle, on continue en mode fallback"
fi

# Démarrer FastAPI
echo "🚀 Démarrage de FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 1