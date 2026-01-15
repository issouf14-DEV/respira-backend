# 🚀 Guide de déploiement - Backend RespirIA

## 📋 Options de déploiement

Voici les différentes façons de déployer votre backend en production :

---

## 1️⃣ Railway (Recommandé - Le plus simple)

**Avantages** :
- ✅ Déploiement en quelques clics
- ✅ PostgreSQL inclus gratuitement
- ✅ HTTPS automatique
- ✅ Logs en temps réel
- ✅ 500h gratuites/mois (suffisant pour débuter)

### Étapes de déploiement

#### A. Préparation du projet

1. **Créer `railway.json`** dans la racine :

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Créer `Procfile`** :

```
web: gunicorn respira_project.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate
```

3. **Modifier `Dockerfile`** pour Railway :

```dockerfile
FROM python:3.11-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer les dépendances Python
COPY requirements/ /app/requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

# Copier le code
COPY . /app/

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput

# Exposer le port
EXPOSE $PORT

# Commande de démarrage
CMD gunicorn respira_project.wsgi:application --bind 0.0.0.0:$PORT
```

#### B. Configuration Railway

1. **Aller sur** : https://railway.app/
2. **Créer un compte** (GitHub recommandé)
3. **Nouveau projet** → "Deploy from GitHub repo"
4. **Sélectionner** votre repository
5. **Ajouter PostgreSQL** :
   - Cliquer sur "+ New"
   - Choisir "Database" → "PostgreSQL"
   - Railway crée automatiquement la variable `DATABASE_URL`

6. **Configurer les variables d'environnement** :

```bash
# Dans Railway Dashboard → Variables
DJANGO_SETTINGS_MODULE=respira_project.settings.production
SECRET_KEY=générez-une-clé-secrète-forte-ici
DJANGO_ALLOWED_HOSTS=.railway.app
CORS_ALLOWED_ORIGINS=https://votreapp.com
DEBUG=False
IQAIR_API_KEY=votre_clé
OPENWEATHER_API_KEY=votre_clé
```

7. **Déployer** :
   - Railway détecte le Dockerfile
   - Build automatique
   - URL générée : `https://votre-app.railway.app`

#### C. Migrations initiales

```bash
# Via Railway CLI (après installation)
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

**Coût estimé** : 0-5$/mois pour débuter

---

## 2️⃣ Render (Alternative gratuite)

**Avantages** :
- ✅ Plan gratuit permanent
- ✅ PostgreSQL gratuit
- ✅ Déploiement automatique depuis GitHub
- ⚠️ Moins performant (mise en veille après 15 min d'inactivité)

### Étapes

1. **Aller sur** : https://render.com/
2. **Nouveau Web Service** → Connecter GitHub
3. **Configuration** :
   - Build Command : `pip install -r requirements/production.txt`
   - Start Command : `gunicorn respira_project.wsgi:application`
4. **Ajouter PostgreSQL** (gratuit)
5. **Variables d'environnement** (mêmes que Railway)
6. **Déployer** !

**Coût** : Gratuit (avec limitations)

---

## 3️⃣ DigitalOcean App Platform

**Avantages** :
- ✅ Infrastructure robuste
- ✅ Scaling facile
- ✅ Logs et monitoring avancés
- ⚠️ Payant dès le début

### Configuration rapide

1. **Créer `app.yaml`** :

```yaml
name: respira-backend
services:
  - name: web
    dockerfile_path: Dockerfile
    github:
      repo: votre-username/respira-backend
      branch: main
    envs:
      - key: DJANGO_SETTINGS_MODULE
        value: respira_project.settings.production
      - key: SECRET_KEY
        value: ${SECRET_KEY}
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
    health_check:
      http_path: /
    http_port: 8000
    instance_count: 1
    instance_size_slug: basic-xxs

databases:
  - name: db
    engine: PG
    version: "15"
```

2. **Déployer** :
   - Aller sur DigitalOcean App Platform
   - "Create App" → GitHub
   - Sélectionner le repo
   - Configurer avec `app.yaml`

**Coût** : À partir de 5$/mois

---

## 4️⃣ AWS EC2 + RDS (Pour production avancée)

**Avantages** :
- ✅ Contrôle total
- ✅ Hautement scalable
- ✅ Services AWS (S3, CloudFront, etc.)
- ⚠️ Configuration complexe

### Architecture AWS

```
┌─────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                   │
│              respira-api.votredomaine.com           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              CloudFront (CDN)                       │
│              + Certificate Manager (SSL)            │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│         Application Load Balancer (ALB)            │
└────────────┬───────────────────────┬────────────────┘
             │                       │
┌────────────▼────────┐  ┌──────────▼─────────┐
│   EC2 Instance 1    │  │   EC2 Instance 2   │
│   (Django + Docker) │  │   (Django + Docker)│
└────────────┬────────┘  └──────────┬─────────┘
             │                       │
             └───────────┬───────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│          RDS PostgreSQL (Base de données)          │
└─────────────────────────────────────────────────────┘
```

### Étapes simplifiées

1. **Créer RDS PostgreSQL** :
   - Type : db.t3.micro (gratuit 12 mois)
   - PostgreSQL 15
   - Activer backups automatiques

2. **Créer EC2** :
   - Ubuntu 22.04 LTS
   - t2.micro (gratuit 12 mois)
   - Installer Docker

3. **Déployer** :

```bash
# Sur EC2
sudo apt update && sudo apt install docker.io docker-compose -y

# Cloner le projet
git clone https://github.com/votre-repo/respira-backend.git
cd respira-backend

# Configurer .env avec les infos RDS
echo "DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/respira_db" > .env

# Lancer
docker-compose -f docker-compose.prod.yml up -d
```

**Coût** : À partir de 15$/mois (hors free tier)

---

## 5️⃣ Docker + VPS (Contrôle maximum)

**Pour** : Contabo, Hetzner, OVH...

### Configuration type

1. **Louer un VPS** (4€-10€/mois)
2. **Installer Docker** :

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

3. **Créer `docker-compose.prod.yml`** :

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: respira_db
      POSTGRES_USER: respira_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always

  web:
    build: .
    command: gunicorn respira_project.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    environment:
      - DJANGO_SETTINGS_MODULE=respira_project.settings.production
      - DATABASE_URL=postgresql://respira_user:${DB_PASSWORD}@db:5432/respira_db
    depends_on:
      - db
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - web
    restart: always

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

4. **Configuration Nginx** (`nginx.conf`) :

```nginx
upstream django {
    server web:8000;
}

server {
    listen 80;
    server_name api.votredomaine.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.votredomaine.com;

    ssl_certificate /etc/letsencrypt/live/api.votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.votredomaine.com/privkey.pem;

    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }
}
```

5. **SSL avec Let's Encrypt** :

```bash
docker-compose run --rm certbot certonly --webroot \
    --webroot-path /var/www/certbot \
    -d api.votredomaine.com
```

---

## 📋 Checklist de déploiement

### Avant déploiement

- [ ] Créer `requirements/production.txt` avec toutes les dépendances
- [ ] Configurer `settings/production.py` :
  - [ ] `DEBUG = False`
  - [ ] `ALLOWED_HOSTS` configuré
  - [ ] `CORS_ALLOWED_ORIGINS` restreint
  - [ ] `SECRET_KEY` sécurisée (pas dans le code)
- [ ] Tester en local avec `DJANGO_SETTINGS_MODULE=respira_project.settings.production`
- [ ] Configurer les backups de base de données
- [ ] Préparer un domaine (optionnel mais recommandé)

### Configuration production

**Fichier** : `respira_project/settings/production.py`

```python
import os
from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')

# Base de données depuis variable d'environnement
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL')
    )
}

# Sécurité
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')

# Fichiers statiques
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

### Après déploiement

- [ ] Tester tous les endpoints avec Postman
- [ ] Créer le superutilisateur : `python manage.py createsuperuser`
- [ ] Vérifier les logs : pas d'erreurs
- [ ] Tester depuis Flutter avec la vraie URL
- [ ] Configurer la surveillance (uptime monitoring)
- [ ] Configurer les sauvegardes automatiques
- [ ] Documenter l'URL de production pour l'équipe

---

## 🔐 Variables d'environnement en production

```bash
# Django
DJANGO_SETTINGS_MODULE=respira_project.settings.production
SECRET_KEY=générez-une-clé-vraiment-secrète-ici-64-caractères
DEBUG=False
ALLOWED_HOSTS=.railway.app,.render.com,api.votredomaine.com
CORS_ALLOWED_ORIGINS=https://votreapp.com,https://www.votreapp.com

# Base de données (générée automatiquement par Railway/Render)
DATABASE_URL=postgresql://user:password@host:5432/database

# APIs externes
IQAIR_API_KEY=votre_clé_iqair
OPENWEATHER_API_KEY=votre_clé_openweather

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre@email.com
EMAIL_HOST_PASSWORD=mot_de_passe_app
```

### Générer une SECRET_KEY sécurisée

```python
# Dans un terminal Python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

---

## 📊 Comparaison des options

| Platform | Coût/mois | Facilité | Performance | Gratuit | Recommandé pour |
|----------|-----------|----------|-------------|---------|-----------------|
| **Railway** | 0-5$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ 500h | **Débutants** |
| **Render** | 0$ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | Tests/MVP |
| **DigitalOcean** | 5-20$ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | Projets sérieux |
| **AWS EC2** | 15-50$ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 12 mois | Production |
| **VPS** | 4-10$ | ⭐⭐ | ⭐⭐⭐⭐ | ❌ | Contrôle total |

---

## 🚦 Tester le déploiement

```powershell
# Remplacez par votre URL de production
$baseUrl = "https://votre-app.railway.app"

# Test 1: Page racine
Invoke-RestMethod -Uri "$baseUrl/"

# Test 2: Login
$body = @{
    email = "test@respira.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/auth/login/" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host "✅ Backend en production fonctionne !" -ForegroundColor Green
Write-Host "Token: $($response.access.Substring(0, 20))..." -ForegroundColor Cyan
```

---

## 📱 Mettre à jour l'URL dans Flutter

```dart
// lib/config/api_config.dart
class ApiConfig {
  // Développement
  // static const String baseUrl = 'http://10.0.2.2:8000';
  
  // Production
  static const String baseUrl = 'https://votre-app.railway.app';
  
  static const String apiVersion = '/api/v1';
  static const String apiBaseUrl = '$baseUrl$apiVersion';
}
```

---

## 🎯 Recommandation

**Pour débuter avec RespirIA** : **Railway**

1. Gratuit pour commencer (500h/mois)
2. Déploiement en 5 minutes
3. PostgreSQL inclus
4. HTTPS automatique
5. Facile à scaler plus tard

**Commencer maintenant** :
1. Push votre code sur GitHub
2. Connectez Railway à votre repo
3. Ajoutez PostgreSQL
4. Configurez les variables d'environnement
5. Déployez !

---

**Votre backend sera accessible en moins de 10 minutes ! 🚀**
