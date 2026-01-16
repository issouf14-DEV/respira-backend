# 🫁 Respira Backend - API REST

**Backend Django REST pour application de santé respiratoire connectée**

Surveillance en temps réel de la qualité de l'air, données météo et capteurs de bracelets connectés (SpO2, fréquence cardiaque).

[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.14-blue.svg)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![Flutter](https://img.shields.io/badge/Flutter-ready-02569B.svg)](https://flutter.dev/)

**✅ Backend 100% opérationnel avec API externes configurées !**

---

## 📋 Table des matières

1. [Technologies](#-technologies)
2. [Démarrage rapide](#-démarrage-rapide-5-minutes)
3. [Configuration](#-configuration)
4. [API pour développeurs Frontend](#-api-pour-développeurs-frontend)
5. [Base de données](#-base-de-données)
6. [Administration](#-interface-dadministration)
7. [Déploiement](#-déploiement)
8. [Dépannage](#-dépannage)

---

## 🛠️ Technologies

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Django** | 4.2 | Framework web backend |
| **Django REST Framework** | 3.14 | API REST + sérialisation |
| **PostgreSQL** | 15 | Base de données |
| **Docker** | Latest | Conteneurisation |
| **Simple JWT** | 5.3.0 | Authentification JWT |
| **IQAir API** | - | Qualité de l'air (AQI, PM2.5) |
| **OpenWeatherMap API** | - | Données météo |

---

## 🚀 Démarrage rapide (5 minutes)

### Prérequis
- ✅ Docker Desktop installé et lancé
- ✅ Git installé (optionnel)

### 1️⃣ Cloner le projet
```bash
git clone <votre-repo>
cd respira-backend-complet
```

### 2️⃣ Configurer les variables d'environnement
Le fichier `.env` est déjà configuré avec :
- ✅ Clés API IQAir et OpenWeatherMap (réelles)
- ✅ Configuration PostgreSQL
- ✅ Secret Django

**Pas de modification nécessaire pour le développement local.**

### 3️⃣ Lancer l'application
```bash
docker compose up -d
```

Attendez 10 secondes que les services démarrent...

### 4️⃣ Vérifier que tout fonctionne
```bash
docker compose ps
```
Vous devriez voir 2 conteneurs `Up` :
- ✅ `respira-backend-complet-web-1` (Django) sur port 8000
- ✅ `respira-backend-complet-db-1` (PostgreSQL) sur port 5432

### 5️⃣ Accéder à l'API
- **API REST** : http://localhost:8000/api/v1/
- **Documentation Swagger** : http://localhost:8000/swagger/
- **Documentation Redoc** : http://localhost:8000/redoc/
- **Interface Admin** : http://localhost:8000/admin/

**🔑 Identifiants de test :**
- Email : `test@respira.com`
- Mot de passe : `TestPass123!`

✅ **C'est tout ! Votre backend est opérationnel.**

---

## ⚙️ Configuration

### Commandes Docker essentielles

```bash
# Démarrer l'application
docker compose up -d

# Arrêter l'application
docker compose down

# Voir l'état des conteneurs
docker compose ps

# Voir les logs (tous les services)
docker compose logs -f

# Voir les logs du serveur Django uniquement
docker compose logs -f web

# Voir les logs de la base de données uniquement
docker compose logs -f db

# Redémarrer les services
docker compose restart

# Reconstruire les images (après modification de code)
docker compose build
docker compose up -d
```

### Variables d'environnement (.env)

```env
# Base de données PostgreSQL
POSTGRES_DB=respira_db
POSTGRES_USER=respira_user
POSTGRES_PASSWORD=respira_password_2024
DB_HOST=db
DB_PORT=5432

# Django
SECRET_KEY=votre-secret-key-super-securisee
DEBUG=True
DJANGO_SETTINGS_MODULE=respira_project.settings.development

# API externes (clés réelles déjà configurées)
IQAIR_API_KEY=votre_cle_iqair_reelle
OPENWEATHER_API_KEY=votre_cle_openweather_reelle

# CORS (autoriser les requêtes depuis Flutter)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

**⚠️ Pour obtenir vos propres clés API :** Consultez `GUIDE_API_KEYS.md`

---

## 🎨 API pour développeurs Frontend

### 📱 URL de base selon votre environnement

| Environnement | URL de base | Usage |
|---------------|-------------|-------|
| **Android Emulator** | `http://10.0.2.2:8000/api/v1` | Développement Android |
| **iOS Simulator** | `http://127.0.0.1:8000/api/v1` | Développement iOS |
| **Appareil réel (même réseau Wi-Fi)** | `http://[VOTRE_IP_LOCAL]:8000/api/v1` | Tests sur téléphone |
| **Production** | `https://votre-domaine.com/api/v1` | Application déployée |

**💡 Pour trouver votre IP locale (appareil réel) :**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### 🔐 Authentification JWT

Tous les endpoints nécessitent un token JWT sauf `/auth/register/` et `/auth/login/`.

#### **1. Inscription (créer un compte)**
```http
POST /api/v1/users/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Réponse 201 Created :**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### **2. Connexion**
```http
POST /api/v1/users/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Réponse 200 OK :** Identique à l'inscription.

#### **3. Rafraîchir le token (quand il expire après 1 heure)**
```http
POST /api/v1/users/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Réponse 200 OK :**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### **4. Utiliser le token dans les requêtes**
```http
GET /api/v1/users/me/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 📊 Endpoints principaux (13 au total)

#### **👤 Profil utilisateur**

```http
# Obtenir le profil de l'utilisateur connecté
GET /api/v1/users/me/
Authorization: Bearer <access_token>

# Modifier le profil
PATCH /api/v1/users/me/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

#### **📱 Bracelets connectés**

```http
# Liste de tous mes bracelets
GET /api/v1/sensors/devices/
Authorization: Bearer <access_token>

# Ajouter un nouveau bracelet
POST /api/v1/sensors/devices/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "device_id": "BRACELET-001",
  "model": "Respira Band Pro",
  "firmware_version": "2.1.0"
}

# Détails d'un bracelet spécifique
GET /api/v1/sensors/devices/{id}/
Authorization: Bearer <access_token>
```

#### **📊 Données des capteurs**

```http
# Envoyer des données de capteurs
POST /api/v1/sensors/data/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "device": 1,
  "spo2": 98,
  "heart_rate": 72
}

# Historique paginé (10 par page)
GET /api/v1/sensors/data/?page=1
Authorization: Bearer <access_token>

# Dernières données enregistrées
GET /api/v1/sensors/data/latest/
Authorization: Bearer <access_token>

# Score de risque calculé automatiquement
GET /api/v1/sensors/data/risk_score/
Authorization: Bearer <access_token>

# Statistiques (moyenne, min, max sur 7 jours)
GET /api/v1/sensors/data/stats/?days=7
Authorization: Bearer <access_token>
```

**⚠️ ATTENTION** : L'endpoint de score de risque utilise un **underscore** : `/risk_score/` (pas de tiret `/risk-score/`).

**Exemple de réponse score de risque :**
```json
{
  "score": 25,
  "level": "LOW",
  "message": "Votre état respiratoire est bon.",
  "last_data": {
    "spo2": 98,
    "heart_rate": 72,
    "timestamp": "2025-11-20T14:30:00Z"
  }
}
```

#### **🌍 Environnement (qualité de l'air + météo)**

```http
# Qualité de l'air actuelle
GET /api/v1/environment/air-quality/current/?city=Abidjan
Authorization: Bearer <access_token>

# Météo actuelle
GET /api/v1/environment/weather/current/?city=Abidjan
Authorization: Bearer <access_token>
```

**Exemple de réponse qualité de l'air (données réelles) :**
```json
{
  "id": 4,
  "city": "Abidjan",
  "aqi": 40,
  "aqi_level": "GOOD",
  "pm25": 25.68,
  "timestamp": "2025-11-20T13:47:19Z"
}
```

**Exemple de réponse météo (données réelles) :**
```json
{
  "id": 3,
  "city": "Abidjan",
  "temperature": 29.98,
  "humidity": 74,
  "description": "partiellement nuageux",
  "timestamp": "2025-11-20T13:47:19Z"
}
```

### 🎨 Codes couleurs pour l'UI

#### **Niveaux de risque**
```dart
// Flutter - Couleurs selon le niveau de risque
Map<String, Color> riskColors = {
  'LOW': Colors.green,           // Vert - Tout va bien
  'MODERATE': Colors.yellow[700], // Jaune - Prudence
  'HIGH': Colors.orange,          // Orange - Attention
  'CRITICAL': Colors.red,         // Rouge - Danger
};
```

#### **Qualité de l'air (AQI)**
```dart
// Flutter - Couleurs selon l'indice AQI
Color getAQIColor(int aqi) {
  if (aqi <= 50) return Colors.green;        // 0-50: GOOD
  if (aqi <= 100) return Colors.yellow[700]; // 51-100: MODERATE
  if (aqi <= 150) return Colors.orange;      // 101-150: UNHEALTHY FOR SENSITIVE
  if (aqi <= 200) return Colors.red;         // 151-200: UNHEALTHY
  return Colors.purple;                       // 201+: VERY UNHEALTHY / HAZARDOUS
}
```

### 📖 Documentation complète pour Flutter

➡️ **Consultez `API_ENDPOINTS_FLUTTER.md`** pour :
- ✅ Tous les 13 endpoints avec exemples complets
- ✅ Code Flutter prêt à l'emploi (classe `ApiService` complète)
- ✅ Gestion automatique du refresh JWT
- ✅ Interception d'erreurs
- ✅ Exemples de tests PowerShell
- ✅ Schémas de requêtes/réponses détaillés

### 🧪 Tester l'API avec PowerShell

```powershell
# 1. Se connecter et obtenir un token
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/auth/login/" -Method POST -ContentType "application/json" -Body '{"email":"test@respira.com","password":"TestPass123!"}'
$token = $response.access

# 2. Utiliser le token pour accéder aux endpoints protégés
$headers = @{ Authorization = "Bearer $token" }

# 3. Obtenir le profil
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/me/" -Headers $headers

# 4. Obtenir la qualité de l'air
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/environment/air-quality/current/?city=Abidjan" -Headers $headers

# 5. Obtenir la météo
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/environment/weather/current/?city=Abidjan" -Headers $headers

# 6. Obtenir le score de risque
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sensors/data/risk_score/" -Headers $headers
```

---

## 💾 Base de données

### Accéder à PostgreSQL

```bash
# Se connecter à la base de données
docker exec -it respira-backend-complet-db-1 psql -U respira_user -d respira_db
```

### Commandes SQL utiles

```sql
-- Lister toutes les tables
\dt

-- Voir la structure d'une table
\d users_user
\d sensors_sensordata

-- Voir tous les utilisateurs
SELECT id, email, first_name, last_name, is_superuser 
FROM users_user;

-- Voir les dernières données de capteurs
SELECT * FROM sensors_sensordata 
ORDER BY timestamp DESC 
LIMIT 10;

-- Voir la qualité de l'air actuelle
SELECT * FROM environment_airquality 
ORDER BY timestamp DESC 
LIMIT 5;

-- Voir les données météo récentes
SELECT * FROM environment_weather 
ORDER BY timestamp DESC 
LIMIT 5;

-- Compter le nombre total d'utilisateurs
SELECT COUNT(*) FROM users_user;

-- Quitter PostgreSQL
\q
```

### Tables disponibles (15)

| Table | Description |
|-------|-------------|
| **Utilisateurs** | |
| `users_user` | Utilisateurs (email, nom, mot de passe hashé) |
| `users_profile` | Profils utilisateurs (informations supplémentaires) |
| `users_user_groups` | Groupes d'utilisateurs |
| `users_user_user_permissions` | Permissions utilisateurs |
| **Capteurs** | |
| `sensors_braceletdevice` | Appareils bracelets connectés (device_id, model, firmware) |
| `sensors_sensordata` | Données capteurs (SpO2, fréquence cardiaque, timestamp) |
| **Environnement** | |
| `environment_airquality` | Qualité de l'air (AQI, PM2.5, niveau, ville) |
| `environment_weather` | Météo (température, humidité, description, ville) |
| **Authentification Django** | |
| `auth_group` | Groupes Django |
| `auth_group_permissions` | Permissions des groupes |
| `auth_permission` | Permissions système |
| **Système Django** | |
| `django_admin_log` | Logs de l'interface admin |
| `django_content_type` | Types de contenu Django |
| `django_migrations` | Historique des migrations |
| `django_session` | Sessions utilisateurs |

### Entrer dans le conteneur Django

```bash
# Accéder au shell du conteneur
docker exec -it respira-backend-complet-web-1 bash

# Une fois à l'intérieur du conteneur
python manage.py shell          # Console Django interactive (Python)
python manage.py showmigrations # Voir l'état des migrations
python manage.py migrate        # Appliquer les migrations
ls                              # Voir les fichiers
exit                            # Sortir du conteneur
```

**Exemple d'utilisation du shell Django :**
```python
# Dans le shell Django (python manage.py shell)
from apps.users.models import User
from apps.sensors.models import SensorData

# Voir tous les utilisateurs
User.objects.all()

# Compter les données de capteurs
SensorData.objects.count()

# Dernières données
SensorData.objects.order_by('-timestamp')[:5]
```

---

## 🔧 Interface d'administration

### Accéder à l'admin Django

```
http://localhost:8000/admin/
```

**🔑 Identifiants de test :**
- Email : `test@respira.com`
- Mot de passe : `TestPass123!`

### Créer un nouveau superutilisateur

```bash
docker exec -it respira-backend-complet-web-1 python manage.py createsuperuser
```

Suivez les instructions :
1. Email : `admin@respira.com`
2. Nom : `Admin`
3. Mot de passe : `VotreMotDePasse123!`
4. Confirmer le mot de passe

### Dans l'admin, vous pouvez gérer :

- 👥 **Users** - Créer, modifier, supprimer des utilisateurs
- 📱 **Bracelet devices** - Voir et gérer tous les bracelets connectés
- 📊 **Sensor data** - Consulter toutes les données de capteurs (SpO2, fréquence cardiaque)
- 🌍 **Air quality** - Historique de la qualité de l'air par ville
- 🌤️ **Weather** - Données météo historiques
- 🔐 **Groups & Permissions** - Gestion des droits d'accès

**Fonctionnalités de l'admin :**
- Filtrage par date, ville, utilisateur
- Recherche par email, device_id, ville
- Export CSV
- Actions en masse (supprimer, modifier)

---

## 🌐 Déploiement

### Option 1 : Railway (Recommandé - Gratuit)

**Pourquoi Railway ?**
- ✅ Gratuit pour commencer ($5 de crédit/mois)
- ✅ Déploiement automatique depuis GitHub
- ✅ PostgreSQL intégré en 1 clic
- ✅ HTTPS automatique
- ✅ Variables d'environnement faciles

**Étapes :**

1. **Créer un compte** sur [railway.app](https://railway.app)

2. **Nouveau projet** → "Deploy from GitHub repo"

3. **Ajouter PostgreSQL** : 
   - Dans le projet → "+ New" → "Database" → "PostgreSQL"
   - Railway génère automatiquement `DATABASE_URL`

4. **Configurer les variables d'environnement** :
   ```
   DEBUG=False
   DJANGO_SETTINGS_MODULE=respira_project.settings.production
   SECRET_KEY=<générer une nouvelle clé sécurisée>
   ALLOWED_HOSTS=votre-app.up.railway.app
   IQAIR_API_KEY=<votre clé IQAir>
   OPENWEATHER_API_KEY=<votre clé OpenWeatherMap>
   CORS_ALLOWED_ORIGINS=https://votre-app-flutter.com
   ```

5. **Railway détecte automatiquement** `Dockerfile` et déploie !

6. **URL de production** : `https://votre-app.up.railway.app`

**📖 Obtenir vos clés API :** Consultez `GUIDE_API_KEYS.md`

### Option 2 : Render (Gratuit)

1. Créer un compte sur [render.com](https://render.com)
2. New → Web Service → Connecter GitHub
3. Ajouter PostgreSQL (New → PostgreSQL)
4. Configurer les variables d'environnement (identiques à Railway)
5. Deploy automatique

### Option 3 : DigitalOcean, AWS EC2, VPS

Pour les déploiements avancés :
- Serveur Ubuntu 22.04
- Docker + Docker Compose
- Nginx reverse proxy
- Certbot pour SSL (Let's Encrypt)
- Configuration firewall

**➡️ Consultez `TROUBLESHOOTING.md` section "Déploiement avancé"**

### Configuration production importante

**Dans `.env` (ou variables d'environnement Railway/Render) :**
```env
# CRITIQUE : Passer en mode production
DEBUG=False
DJANGO_SETTINGS_MODULE=respira_project.settings.production

# Domaines autorisés
ALLOWED_HOSTS=votre-domaine.com,votre-app.up.railway.app

# CORS (autoriser votre app Flutter)
CORS_ALLOWED_ORIGINS=https://votre-app-flutter.com,https://app.respira.com

# Sécurité HTTPS
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000

# Nouvelle clé secrète (NE PAS utiliser celle de développement)
SECRET_KEY=<générer avec: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
```

**Après déploiement, exécuter les migrations :**
```bash
# Railway : dans l'onglet "Deployments" → "Command"
python manage.py migrate

# Créer un superutilisateur en production
python manage.py createsuperuser
```

---

## 🐛 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Voir les logs d'erreur détaillés
docker compose logs

# Arrêter complètement
docker compose down

# Reconstruire les images sans cache
docker compose build --no-cache

# Redémarrer
docker compose up -d
```

### Erreur "port 8000 already in use"

**Windows :**
```powershell
# Trouver le processus utilisant le port 8000
netstat -ano | findstr :8000

# Tuer le processus (remplacer <PID> par le numéro affiché)
taskkill /PID <PID> /F
```

**Mac/Linux :**
```bash
# Trouver et tuer le processus
lsof -ti:8000 | xargs kill -9
```

**Ou changer le port dans `docker-compose.yml` :**
```yaml
services:
  web:
    ports:
      - "8001:8000"  # Utiliser 8001 au lieu de 8000
```

### Réinitialiser complètement la base de données

⚠️ **ATTENTION : Supprime toutes les données !**

```bash
# Arrêter et supprimer les volumes
docker compose down -v

# Redémarrer
docker compose up -d

# Attendre 10 secondes, puis appliquer les migrations
docker exec -it respira-backend-complet-web-1 python manage.py migrate

# Recréer un superutilisateur
docker exec -it respira-backend-complet-web-1 python manage.py createsuperuser
```

### Erreur "Invalid token" / "Token has expired"

Le token JWT expire après **1 heure**. Solutions :

1. **Utiliser le refresh token** pour obtenir un nouveau access token :
   ```http
   POST /api/v1/users/auth/refresh/
   Content-Type: application/json
   
   {
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```

2. **Ou se reconnecter** pour obtenir de nouveaux tokens :
   ```http
   POST /api/v1/users/auth/login/
   ```

### API externes (IQAir / OpenWeatherMap) retournent des erreurs

**Vérifier que les clés API sont valides dans `.env` :**

```bash
# Afficher les variables d'environnement dans le conteneur
docker exec respira-backend-complet-web-1 printenv | grep API

# Tester IQAir manuellement
curl "http://api.airvisual.com/v2/city?city=Abidjan&state=Abidjan&country=Ivory-Coast&key=VOTRE_CLE_IQAIR"

# Tester OpenWeatherMap manuellement
curl "http://api.openweathermap.org/data/2.5/weather?q=Abidjan&appid=VOTRE_CLE_OPENWEATHER&units=metric"
```

**Si les clés ne fonctionnent pas :**
1. Vérifiez qu'elles sont bien copiées dans `.env` (sans espaces)
2. Redémarrez les conteneurs : `docker compose restart`
3. Consultez `GUIDE_API_KEYS.md` pour obtenir de nouvelles clés

### Erreur 500 Internal Server Error

```bash
# Voir les logs Django détaillés
docker compose logs -f web

# Entrer dans le conteneur pour investiguer
docker exec -it respira-backend-complet-web-1 bash
python manage.py check
python manage.py showmigrations
```

### Problème de permissions (403 Forbidden)

- Vérifiez que le token JWT est bien inclus dans le header `Authorization: Bearer <token>`
- Vérifiez que l'utilisateur est bien authentifié
- Certains endpoints nécessitent des permissions spécifiques

### Plus de solutions

**➡️ Consultez `TROUBLESHOOTING.md` pour :**
- Problèmes de connexion base de données
- Erreurs de migrations
- Problèmes CORS
- Déploiement avancé
- Performance et optimisation

---

## 📚 Fichiers de documentation

| Fichier | Description | Pour qui ? |
|---------|-------------|------------|
| **README.md** | **CE FICHIER** - Documentation principale | Tous |
| **API_ENDPOINTS_FLUTTER.md** | Guide complet API avec code Flutter | Développeurs Frontend |
| **GUIDE_API_KEYS.md** | Comment obtenir les clés IQAir et OpenWeatherMap | Tous |
| **TROUBLESHOOTING.md** | Solutions aux problèmes courants | Tous |

**Fichiers supprimés (redondants) :**
- ❌ API_DOCUMENTATION.md (redondant avec API_ENDPOINTS_FLUTTER.md)
- ❌ BACKEND_AUDIT_COMPLET.md (audit interne, pas nécessaire pour utilisation)
- ❌ BACKEND_EXPLAINED.md (explications intégrées dans README)
- ❌ DEPLOYMENT_GUIDE.md (déjà dans README section Déploiement)
- ❌ DJANGO_TUTORIAL.md (pour apprendre Django, pas pour utiliser le backend)
- ❌ FILES_INDEX.md (structure de fichiers, pas nécessaire)
- ❌ FINAL_SUMMARY.md, SETUP_COMPLETE.md, etc. (status/logs internes)

---

## 🎯 Checklist pour développeurs Frontend

Avant de commencer votre application Flutter, vérifiez :

- [ ] ✅ Backend lancé : `docker compose ps` affiche 2 conteneurs "Up"
- [ ] ✅ API accessible : http://localhost:8000/swagger/ s'ouvre dans le navigateur
- [ ] ✅ Identifiants de test fonctionnent : `test@respira.com` / `TestPass123!`
- [ ] ✅ Données réelles disponibles : `/environment/air-quality/current/?city=Abidjan` retourne AQI
- [ ] ✅ Documentation Flutter lue : `API_ENDPOINTS_FLUTTER.md`
- [ ] ✅ URL de base correcte selon votre appareil :
  - Android Emulator : `http://10.0.2.2:8000/api/v1`
  - iOS Simulator : `http://127.0.0.1:8000/api/v1`
  - Appareil réel : `http://[VOTRE_IP]:8000/api/v1`

**Prêt à coder ! 🚀**

---

## 🤝 Support & Contribution

### Obtenir de l'aide
- 📖 **Documentation API** : http://localhost:8000/swagger/
- 🐛 **Problèmes** : Consultez `TROUBLESHOOTING.md`
- 💬 **Questions** : Ouvrir une issue sur GitHub

### Tester l'API
- Scripts PowerShell dans `test_api.ps1`
- Swagger UI interactif : http://localhost:8000/swagger/
- Exemples complets dans `API_ENDPOINTS_FLUTTER.md`

### Contribuer
1. Fork le projet
2. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
3. Commit : `git commit -m "Ajout de nouvelle fonctionnalité"`
4. Push : `git push origin feature/nouvelle-fonctionnalite`
5. Ouvrir une Pull Request

---

## 📊 Structure du projet

```
respira-backend-complet/
├── api/                           # Configuration API (versioning)
│   └── v1/
│       └── urls.py               # Routes API v1
├── apps/                         # Applications Django
│   ├── users/                   # Gestion utilisateurs + authentification
│   │   ├── models.py           # Modèle User personnalisé
│   │   ├── serializers.py      # Sérialisation User/Profile
│   │   └── views.py            # Endpoints auth + profil
│   ├── sensors/                # Capteurs et bracelets
│   │   ├── models.py          # BraceletDevice, SensorData
│   │   ├── serializers.py     # Sérialisation capteurs
│   │   └── views.py           # Endpoints capteurs + risk_score
│   └── environment/           # Qualité air + météo
│       ├── models.py         # AirQuality, Weather
│       ├── services/         # Intégration API externes
│       │   ├── iqair_service.py
│       │   └── weather_service.py
│       └── views.py          # Endpoints environnement
├── respira_project/          # Configuration Django
│   ├── settings/
│   │   ├── base.py          # Settings communs
│   │   ├── development.py  # Settings développement
│   │   └── production.py   # Settings production
│   └── urls.py             # URLs principales
├── requirements/           # Dépendances Python
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── docker-compose.yml     # Orchestration Docker
├── Dockerfile            # Image Docker Django
├── .env                 # Variables d'environnement
└── manage.py           # Script de gestion Django
```

---

## 📄 Licence

**MIT License** - Respira Backend 2025

Vous êtes libre de :
- ✅ Utiliser ce code commercialement
- ✅ Modifier le code
- ✅ Distribuer le code
- ✅ Utiliser en privé

Conditions :
- 📝 Inclure la licence et le copyright dans toute copie

---

## ⭐ Statut du projet

**✅ Backend 100% opérationnel et prêt pour la production !**

- ✅ Authentification JWT sécurisée
- ✅ 13 endpoints API documentés et testés
- ✅ API externes configurées (IQAir + OpenWeatherMap)
- ✅ Base de données PostgreSQL avec 15 tables
- ✅ Interface admin fonctionnelle
- ✅ Docker prêt pour développement et production
- ✅ Documentation complète pour développeurs Frontend
- ✅ Tests unitaires disponibles
- ✅ CORS configuré pour Flutter

**Prochaine étape :** Développer l'application Flutter ! 🎨📱

---

**Made with ❤️ for Respira Project**
 
 