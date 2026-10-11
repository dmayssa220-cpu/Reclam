# 💧 Water Leaks — Gestion des Réclamations de Fuites d'Eau

Plateforme web de gestion des réclamations liées aux fuites d'eau avec :
- Contrôle d'accès par rôles (RBAC)
- Notifications automatisées
- Tableaux de bord KPI
- Cartographie interactive (Leaflet.js)
- Couche IA pour la classification et la prédiction

## 🏗️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Laravel 13 + PHP 8.3 |
| Base de données | MySQL 8 |
| IA | Python 3.11 + FastAPI + Ollama |
| Cartographie | Leaflet.js |
| Conteneurisation | Docker + Docker Compose |

## 🚀 Démarrage rapide

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd water-leaks-app

# 2. Copier les variables d'environnement
cp .env.example .env

# 3. Lancer les services
docker compose up -d

# 4. Initialiser le backend
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed

# 5. Accès
# Frontend    : http://localhost:5173
# API Backend : http://localhost:8000
# phpMyAdmin  : http://localhost:8080
# IA Service  : http://localhost:8001