# 🏗️ Architecture et Fonctionnement - Backend RespirIA

## 📊 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Flutter                          │
│                  (Android/iOS - Frontend)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ (JSON)
┌────────────────────▼────────────────────────────────────────────┐
│                    DJANGO REST FRAMEWORK                        │
│                    http://localhost:8000                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Users App  │  │ Sensors App  │  │Environment  │        │
│  │              │  │              │  │     App      │        │
│  │ - Auth JWT   │  │ - Données    │  │ - Air        │        │
│  │ - Profils    │  │ - Bracelets  │  │ - Météo      │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │ ORM (Object-Relational Mapping)
┌────────────────────────────▼────────────────────────────────────┐
│                    PostgreSQL 15                                │
│                    (Base de données)                            │
│                                                                 │
│  Tables: users, profiles, sensors, bracelets,                  │
│          air_quality, weather_data                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux d'une requête API

### Exemple : Login utilisateur

```
1. Flutter envoie:
   POST http://localhost:8000/api/v1/users/auth/login/
   Body: {"email": "test@respira.com", "password": "TestPass123!"}
   
2. Django reçoit la requête:
   ↓
   urls.py → Route vers UserViewSet
   ↓
   views.py → Méthode login()
   ↓
   serializers.py → Valide les données
   ↓
   models.py → Vérifie dans la BD
   ↓
   Simple JWT → Génère les tokens
   
3. Django répond:
   {
     "access": "eyJhbGc...",  // Token valide 1h
     "refresh": "eyJhbGc...", // Token valide 7j
     "user": {...}
   }
   
4. Flutter stocke les tokens:
   flutter_secure_storage.write('access_token', token)
```

---

## 📁 Structure du code Django

### 1. Models (models.py) - Les tables de la BD

**Fichier** : `apps/users/models.py`

```python
class CustomUser(AbstractUser):
    """Table users_customuser dans PostgreSQL"""
    email = models.EmailField(unique=True)  # Colonne email
    phone = models.CharField(max_length=20) # Colonne phone
    # Django crée automatiquement : id, username, password, etc.

class UserProfile(models.Model):
    """Table users_userprofile dans PostgreSQL"""
    user = models.OneToOneField(CustomUser)  # Relation 1-1
    profile_type = models.CharField(...)     # ASTHMATIC, PREVENTION, etc.
    city = models.CharField(...)
    alerts_enabled = models.BooleanField(...)
```

**Comment ça marche** :
- Chaque classe = 1 table PostgreSQL
- Chaque attribut = 1 colonne
- Django génère automatiquement le SQL

**Exemple de requête automatique** :
```python
# Python (dans le shell Django)
user = CustomUser.objects.get(email='test@respira.com')
print(user.username)  # 'testuser'
print(user.profile.city)  # 'Abidjan'

# SQL équivalent (Django le fait automatiquement)
# SELECT * FROM users_customuser WHERE email='test@respira.com';
# SELECT * FROM users_userprofile WHERE user_id=2;
```

---

### 2. Serializers (serializers.py) - Conversion JSON ↔ Python

**Fichier** : `apps/users/serializers.py`

```python
class UserSerializer(serializers.ModelSerializer):
    """Convertit User (Python) ↔ JSON"""
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name']
    
    # Validation automatique
    def validate_email(self, value):
        if '@' not in value:
            raise ValidationError("Email invalide")
        return value
```

**Flux de données** :

```
# Requête entrante (JSON → Python)
{"email": "test@respira.com", "username": "testuser"}
         ↓ Serializer.is_valid()
CustomUser(email='test@respira.com', username='testuser')
         ↓ save()
INSERT INTO users_customuser...

# Réponse sortante (Python → JSON)
CustomUser.objects.get(id=2)
         ↓ UserSerializer(user)
         ↓ serializer.data
{"id": 2, "email": "test@respira.com", "username": "testuser"}
```

---

### 3. Views (views.py) - La logique métier

**Fichier** : `apps/users/views.py`

```python
class UserViewSet(viewsets.ModelViewSet):
    """Gère les endpoints /api/v1/users/"""
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # JWT requis
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Endpoint personnalisé : POST /api/v1/users/auth/login/"""
        # 1. Récupérer les données
        email = request.data.get('email')
        password = request.data.get('password')
        
        # 2. Vérifier dans la BD
        user = authenticate(email=email, password=password)
        
        # 3. Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # 4. Retourner la réponse
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
```

**Django REST Framework fournit automatiquement** :
- `list()` → GET /users/ (liste tous)
- `retrieve()` → GET /users/1/ (un seul)
- `create()` → POST /users/ (créer)
- `update()` → PUT /users/1/ (modifier)
- `destroy()` → DELETE /users/1/ (supprimer)

---

### 4. URLs (urls.py) - Le routage

**Fichier** : `apps/users/urls.py`

```python
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register('', UserViewSet, basename='users')

# Génère automatiquement :
# GET    /api/v1/users/           → UserViewSet.list()
# POST   /api/v1/users/           → UserViewSet.create()
# GET    /api/v1/users/1/         → UserViewSet.retrieve()
# PUT    /api/v1/users/1/         → UserViewSet.update()
# DELETE /api/v1/users/1/         → UserViewSet.destroy()
# POST   /api/v1/users/auth/login/ → UserViewSet.login()
```

---

## 🔐 Authentification JWT (JSON Web Token)

### Comment ça fonctionne

```
1. Login réussi:
   ↓
   Django génère 2 tokens:
   - Access Token (1 heure)   → Pour les requêtes API
   - Refresh Token (7 jours)  → Pour renouveler l'access

2. Requête API protégée:
   Flutter envoie:
   GET /api/v1/users/me/
   Headers: Authorization: Bearer eyJhbGc...
   
   Django vérifie:
   ↓ Token valide ? OUI
   ↓ Token expiré ? NON
   ↓ OK → Retourne les données
   
3. Access token expiré (après 1h):
   Flutter envoie:
   POST /api/v1/users/auth/refresh/
   Body: {"refresh": "eyJhbGc..."}
   
   Django répond:
   {
     "access": "nouveau_token..."  // Valide 1h de plus
   }
```

---

## 🗄️ Structure de la base de données

### Tables principales

#### 1. users_customuser
```sql
id  | email              | username   | password (hashé)
----|--------------------|------------|------------------
1   | admin@respira.com  | admin      | pbkdf2_sha256$...
2   | test@respira.com   | testuser   | pbkdf2_sha256$...
```

#### 2. users_userprofile
```sql
id | user_id | profile_type | city    | alerts_enabled
---|---------|--------------|---------|---------------
1  | 2       | ASTHMATIC    | Abidjan | true
```

#### 3. sensors_bracelet
```sql
id | user_id | device_id    | name           | is_active
---|---------|--------------|----------------|----------
1  | 2       | BRC001       | Mon bracelet   | true
```

#### 4. sensors_sensordata
```sql
id | user_id | bracelet_id | timestamp           | spo2 | heart_rate
---|---------|-------------|---------------------|------|------------
1  | 2       | 1           | 2025-11-19 20:30:00 | 98   | 75
```

### Relations entre tables

```
users_customuser (1) ←→ (1) users_userprofile
       │
       │ (1)
       │
       ↓ (N)
sensors_bracelet
       │
       │ (1)
       │
       ↓ (N)
sensors_sensordata
```

---

## 🔍 Accéder à la base de données

### Option 1 : Shell Django (Recommandé)

```powershell
docker compose exec web python manage.py shell
```

```python
# Lister tous les utilisateurs
from apps.users.models import CustomUser
users = CustomUser.objects.all()
for user in users:
    print(f"{user.id}: {user.email}")

# Trouver un utilisateur
user = CustomUser.objects.get(email='test@respira.com')
print(f"Username: {user.username}")
print(f"Profil: {user.profile.profile_type}")

# Voir les données capteurs d'un utilisateur
from apps.sensors.models import SensorData
data = SensorData.objects.filter(user=user).order_by('-timestamp')[:5]
for d in data:
    print(f"{d.timestamp}: SpO2={d.spo2}%, FC={d.heart_rate}")

# Créer une nouvelle donnée
new_data = SensorData.objects.create(
    user=user,
    bracelet_id=1,
    spo2=97,
    heart_rate=72,
    temperature=36.5
)
print(f"Donnée créée: ID {new_data.id}")

# Modifier un utilisateur
user.first_name = "Nouveau nom"
user.save()

# Supprimer (attention !)
# user.delete()
```

### Option 2 : Admin Django

Ouvrez http://localhost:8000/admin/

**Avantages** :
- Interface graphique
- Voir toutes les tables
- Modifier facilement
- Filtrer, rechercher

### Option 3 : SQL direct

```powershell
docker compose exec db psql -U respira_user -d respira_db
```

```sql
-- Voir toutes les tables
\dt

-- Compter les utilisateurs
SELECT COUNT(*) FROM users_customuser;

-- Voir les dernières données capteur
SELECT u.email, s.spo2, s.heart_rate, s.timestamp 
FROM sensors_sensordata s
JOIN users_customuser u ON s.user_id = u.id
ORDER BY s.timestamp DESC
LIMIT 5;

-- Statistiques
SELECT 
    u.email,
    COUNT(s.id) as nb_mesures,
    AVG(s.spo2) as spo2_moyen,
    AVG(s.heart_rate) as fc_moyenne
FROM sensors_sensordata s
JOIN users_customuser u ON s.user_id = u.id
GROUP BY u.email;
```

---

## 🔄 ORM Django vs SQL brut

### Exemple : Récupérer les données d'un utilisateur

**Avec ORM Django (recommandé)** :
```python
user = CustomUser.objects.get(email='test@respira.com')
data = user.sensordata_set.all()  # Relation inverse automatique
```

**SQL équivalent** :
```sql
SELECT * FROM users_customuser WHERE email='test@respira.com';
SELECT * FROM sensors_sensordata WHERE user_id=2;
```

**Avantages de l'ORM** :
- ✅ Code Python (pas de SQL à écrire)
- ✅ Protection contre les injections SQL
- ✅ Relations automatiques
- ✅ Migrations automatiques
- ✅ Compatible tous les SGBD (PostgreSQL, MySQL, SQLite)

---

## 📦 Les 3 applications Django

### 1. users (Utilisateurs)

**Rôle** : Authentification, profils

**Modèles** :
- `CustomUser` : Compte utilisateur (email, password)
- `UserProfile` : Informations supplémentaires (type, ville, alertes)

**Endpoints** :
- POST `/api/v1/users/auth/register/` - Inscription
- POST `/api/v1/users/auth/login/` - Connexion
- POST `/api/v1/users/auth/refresh/` - Rafraîchir token
- GET `/api/v1/users/me/` - Mon profil
- PUT `/api/v1/users/me/profile/` - Modifier profil

### 2. sensors (Capteurs)

**Rôle** : Données biométriques, bracelets

**Modèles** :
- `Bracelet` : Appareil connecté
- `SensorData` : Mesures (SpO2, FC, température)

**Endpoints** :
- POST `/api/v1/sensors/data/` - Envoyer données
- GET `/api/v1/sensors/data/latest/` - Dernières données
- GET `/api/v1/sensors/data/risk_score/` - Score de risque
- GET `/api/v1/sensors/data/stats/` - Statistiques

**Logique métier** :
```python
def calculate_risk_score(spo2, heart_rate):
    """Calcule le risque d'asthme"""
    score = 0
    if spo2 < 95:
        score += 30
    if heart_rate > 100:
        score += 20
    # ...
    return score  # 0-100
```

### 3. environment (Environnement)

**Rôle** : Qualité de l'air, météo

**Modèles** :
- `AirQuality` : Données IQAir
- `WeatherData` : Données OpenWeather

**Endpoints** :
- GET `/api/v1/environment/air-quality/current/` - Air
- GET `/api/v1/environment/weather/current/` - Météo

**Services externes** :
```python
# apps/environment/services/iqair_service.py
class IQAirService:
    def get_city_air_quality(self, city):
        response = requests.get(
            f'https://api.iqair.com/v2/city?city={city}',
            params={'key': settings.IQAIR_API_KEY}
        )
        return response.json()
```

---

## 🛠️ Commandes Django utiles

```powershell
# Shell interactif
docker compose exec web python manage.py shell

# Créer des migrations (après modification de models.py)
docker compose exec web python manage.py makemigrations

# Appliquer les migrations
docker compose exec web python manage.py migrate

# Créer un superutilisateur
docker compose exec web python manage.py createsuperuser

# Voir l'état des migrations
docker compose exec web python manage.py showmigrations

# Dump de la BD (backup)
docker compose exec web python manage.py dumpdata > backup.json

# Restaurer
docker compose exec web python manage.py loaddata backup.json

# Tests
docker compose exec web python manage.py test

# Console SQL Django
docker compose exec web python manage.py dbshell
```

---

## 📊 Exemple complet : Envoyer des données capteur

### 1. Depuis Flutter

```dart
final dio = Dio();
final response = await dio.post(
  'http://10.0.2.2:8000/api/v1/sensors/data/',
  data: {
    'spo2': 98,
    'heart_rate': 75,
    'respiratory_rate': 16,
    'temperature': 36.8,
    'activity_level': 'REST',
    'timestamp': DateTime.now().toIso8601String(),
  },
  options: Options(
    headers: {'Authorization': 'Bearer $accessToken'},
  ),
);
```

### 2. Django reçoit et traite

```python
# views.py
class SensorDataViewSet(viewsets.ModelViewSet):
    def create(self, request):
        # 1. Valider les données
        serializer = SensorDataSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 2. Ajouter l'utilisateur (depuis le token JWT)
        serializer.save(user=request.user)
        
        # 3. Calculer le score de risque
        data = serializer.instance
        data.risk_score = self.calculate_risk(data)
        data.save()
        
        # 4. Retourner la réponse
        return Response(
            SensorDataSerializer(data).data,
            status=status.HTTP_201_CREATED
        )
```

### 3. Données stockées dans PostgreSQL

```sql
INSERT INTO sensors_sensordata (
    user_id, bracelet_id, timestamp, spo2, heart_rate,
    respiratory_rate, temperature, activity_level, risk_score
) VALUES (
    2, 1, '2025-11-19 20:30:00', 98, 75, 16, 36.8, 'REST', 10
);
```

---

## 🎯 Résumé du flux complet

```
Flutter (POST données)
    ↓
Django URLs (routing)
    ↓
Django Views (logique)
    ↓
Serializers (validation)
    ↓
Models (ORM)
    ↓
PostgreSQL (stockage)
    ↓
Models (ORM)
    ↓
Serializers (JSON)
    ↓
Django Views (réponse)
    ↓
Flutter (reçoit 201 Created)
```

---

## 🔍 Explorer votre BD maintenant

```powershell
# Ouvrir le shell Django
docker compose exec web python manage.py shell
```

```python
# Voir combien d'utilisateurs
from apps.users.models import CustomUser
print(f"Utilisateurs: {CustomUser.objects.count()}")

# Voir toutes les données capteur
from apps.sensors.models import SensorData
for data in SensorData.objects.all()[:5]:
    print(f"{data.user.email}: SpO2={data.spo2}%, Risque={data.risk_level}")

# Créer une nouvelle mesure
from datetime import datetime
new = SensorData.objects.create(
    user_id=2,
    bracelet_id=1,
    spo2=96,
    heart_rate=80,
    timestamp=datetime.now()
)
print(f"✅ Donnée créée: ID {new.id}")
```

**Vous comprenez maintenant comment tout fonctionne ? 🚀**
