# 🫁 RespirIA Backend API

API Backend pour l'application RespirIA - Système de surveillance et prévention de l'asthme.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Endpoints API](#endpoints-api)
- [Tests](#tests)
- [Déploiement](#déploiement)

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion avec JWT
- Gestion des profils utilisateurs (Asthmatique, Prévention, Rémission)
- Authentification sécurisée avec tokens refresh

### 📊 Capteurs & Données de santé
- Gestion des bracelets connectés
- Collecte des données biométriques (SpO2, fréquence cardiaque, température)
- Calcul du score de risque d'asthme
- Statistiques et historique des données

### 🌍 Environnement
- Surveillance de la qualité de l'air (IQAir API)
- Données météorologiques (OpenWeatherMap API)
- Alertes en temps réel

## 🛠 Technologies

- **Django 4.2** - Framework web
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Docker & Docker Compose** - Containerisation
- **Swagger/OpenAPI** - Documentation API

## 🚀 Installation

### Prérequis

- Docker Desktop installé
- Git

### 1. Cloner le projet

```bash
git clone <repository-url>
cd respira-backend-complet
```

### 2. Configuration de l'environnement

Le fichier `.env` est déjà configuré avec :

```env
SECRET_KEY=<votre-clé-secrète>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DB_NAME=respira_db
DB_USER=respira_user
DB_PASSWORD=changeme
DB_HOST=db
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# APIs externes (optionnel)
IQAIR_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

### 3. Démarrer avec Docker

```powershell
# Ajouter Docker au PATH (si nécessaire)
$env:Path += ";C:\Program Files\Docker\Docker\resources\bin"

# Construire et démarrer les conteneurs
docker compose build
docker compose up -d

# Vérifier que les conteneurs fonctionnent
docker compose ps

# Appliquer les migrations
docker compose exec web python manage.py migrate

# Créer un superutilisateur
docker compose exec web python manage.py createsuperuser
```

### 4. Accéder à l'application

- **API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin
- **Documentation Swagger**: http://localhost:8000/swagger/

## 📝 Endpoints API

### Authentification (`/api/v1/users/`)

#### Inscription
```http
POST /api/v1/users/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "profile_type": "ASTHMATIC",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Connexion
```http
POST /api/v1/users/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

#### Profil utilisateur
```http
GET /api/v1/users/me/
Authorization: Bearer <access_token>
```

#### Mise à jour du profil
```http
PUT /api/v1/users/me/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "profile_type": "PREVENTION",
  "city": "Abidjan",
  "alerts_enabled": true
}
```

### Capteurs (`/api/v1/sensors/`)

#### Envoyer des données de capteur
```http
POST /api/v1/sensors/data/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "timestamp": "2025-11-19T20:30:00Z",
  "spo2": 98,
  "heart_rate": 75,
  "respiratory_rate": 16,
  "temperature": 36.8,
  "activity_level": "REST",
  "risk_score": 25
}
```

#### Dernières données
```http
GET /api/v1/sensors/data/latest/
Authorization: Bearer <access_token>
```

#### Score de risque actuel
```http
GET /api/v1/sensors/data/risk_score/
Authorization: Bearer <access_token>

Response:
{
  "risk_score": 25,
  "risk_level": "LOW",
  "timestamp": "2025-11-19T20:30:00Z"
}
```

#### Statistiques
```http
GET /api/v1/sensors/data/stats/?period=24h
Authorization: Bearer <access_token>

Response:
{
  "period": "24h",
  "stats": {
    "avg_spo2": 97.5,
    "min_spo2": 95,
    "avg_heart_rate": 72,
    "max_heart_rate": 85
  }
}
```

### Environnement (`/api/v1/environment/`)

#### Qualité de l'air actuelle
```http
GET /api/v1/environment/air-quality/current/?city=Abidjan
Authorization: Bearer <access_token>

Response:
{
  "id": 1,
  "city": "Abidjan",
  "timestamp": "2025-11-19T20:00:00Z",
  "aqi": 45,
  "aqi_level": "GOOD",
  "pm25": 12.5
}
```

#### Météo actuelle
```http
GET /api/v1/environment/weather/current/?city=Abidjan
Authorization: Bearer <access_token>

Response:
{
  "id": 1,
  "city": "Abidjan",
  "timestamp": "2025-11-19T20:00:00Z",
  "temperature": 28.5,
  "humidity": 75,
  "description": "Ensoleillé"
}
```

## 🧪 Tests

### Avec PowerShell

```powershell
# Variables
$baseUrl = "http://localhost:8000/api/v1"

# Test d'inscription
$registerBody = @{
    email = "test@respira.com"
    username = "testuser"
    password = "TestPass123!"
    password_confirm = "TestPass123!"
    profile_type = "ASTHMATIC"
    first_name = "Test"
    last_name = "User"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/users/auth/register/" -Method POST -Body $registerBody -ContentType 'application/json'

# Test de connexion
$loginBody = @{
    email = "test@respira.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/users/auth/login/" -Method POST -Body $loginBody -ContentType 'application/json'
$tokens = $response.Content | ConvertFrom-Json

# Test d'endpoint protégé
$headers = @{
    Authorization = "Bearer $($tokens.access)"
}

Invoke-WebRequest -Uri "$baseUrl/users/me/" -Method GET -Headers $headers
```

## 🔧 Commandes utiles

### Docker

```powershell
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Voir les logs
docker compose logs -f web

# Redémarrer un service
docker compose restart web

# Reconstruire les images
docker compose build --no-cache

# Accéder au shell du conteneur
docker compose exec web bash

# Exécuter des commandes Django
docker compose exec web python manage.py <command>
```

### Django

```powershell
# Créer des migrations
docker compose exec web python manage.py makemigrations

# Appliquer les migrations
docker compose exec web python manage.py migrate

# Créer un superutilisateur
docker compose exec web python manage.py createsuperuser

# Shell Django
docker compose exec web python manage.py shell

# Collecter les fichiers statiques
docker compose exec web python manage.py collectstatic
```

## 📦 Structure du projet

```
respira-backend-complet/
├── apps/
│   ├── users/              # Gestion des utilisateurs
│   ├── sensors/            # Données des capteurs
│   └── environment/        # Qualité air & météo
│       └── services/       # Services API externes
├── respira_project/
│   ├── settings/           # Configuration
│   └── urls.py            # Routes principales
├── requirements/
│   ├── base.txt           # Dépendances de base
│   └── production.txt     # Dépendances production
├── docker-compose.yml     # Configuration Docker
├── Dockerfile            # Image Docker
└── .env                  # Variables d'environnement
```

## 🔒 Sécurité

- Authentification JWT avec tokens refresh
- CORS configuré pour les origines autorisées
- Mots de passe hashés avec bcrypt
- Variables d'environnement pour les secrets
- HTTPS recommandé en production

## 🌐 APIs Externes

### IQAir (Qualité de l'air)
- Obtenez une clé API sur https://www.iqair.com/fr/air-pollution-data-api
- Ajoutez-la dans `.env` : `IQAIR_API_KEY=votre_clé`

### OpenWeatherMap (Météo)
- Obtenez une clé API sur https://openweathermap.org/api
- Ajoutez-la dans `.env` : `OPENWEATHER_API_KEY=votre_clé`

**Note**: Le système fonctionne avec des données simulées si les clés API ne sont pas configurées.

## 📊 Base de données

PostgreSQL 15 avec les tables suivantes :
- `users_user` - Utilisateurs
- `users_profile` - Profils utilisateurs
- `sensors_braceletdevice` - Appareils connectés
- `sensors_sensordata` - Données biométriques
- `environment_airquality` - Qualité de l'air
- `environment_weather` - Données météo

## 🚀 Déploiement en production

1. Modifier `.env` pour la production :
```env
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com
SECRET_KEY=<générer-une-nouvelle-clé-forte>
```

2. Utiliser les paramètres de production :
```bash
export DJANGO_SETTINGS_MODULE=respira_project.settings.production
```

3. Configurer un serveur web (Nginx) et WSGI (Gunicorn)

4. Activer HTTPS avec Let's Encrypt

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur le dépôt GitHub.

## 📄 Licence

Ce projet est sous licence MIT.
