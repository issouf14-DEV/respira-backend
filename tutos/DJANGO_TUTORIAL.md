# 🎓 Apprendre Django REST Framework - Guide Complet

## 📚 Table des matières

1. [Django : Les bases](#django-les-bases)
2. [Django REST Framework](#django-rest-framework)
3. [Votre projet RespirIA expliqué](#votre-projet-respira)
4. [Exercices pratiques](#exercices-pratiques)
5. [Ressources supplémentaires](#ressources)

---

## 🏗️ Django : Les bases

### Qu'est-ce que Django ?

Django est un **framework web Python** qui suit le pattern **MVT** (Model-View-Template).

```
┌─────────────────────────────────────────────────┐
│                   DJANGO                        │
│                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  Models  │───▶│  Views   │───▶│ Templates│ │
│  │(Données) │    │(Logique) │    │  (HTML)  │ │
│  └──────────┘    └──────────┘    └──────────┘ │
│       │                                        │
│       ▼                                        │
│  ┌──────────┐                                 │
│  │PostgreSQL│                                 │
│  └──────────┘                                 │
└─────────────────────────────────────────────────┘
```

Pour une **API REST**, on remplace les Templates par **JSON** :

```
Models (DB) → Views (Logique) → JSON Response
```

---

### 1️⃣ Les Models (Modèles)

Les models définissent la **structure de votre base de données**.

#### Exemple simple : Un blog

```python
# models.py
from django.db import models

class Article(models.Model):
    titre = models.CharField(max_length=200)      # VARCHAR(200)
    contenu = models.TextField()                  # TEXT
    auteur = models.CharField(max_length=100)     # VARCHAR(100)
    date_publication = models.DateTimeField(auto_now_add=True)  # TIMESTAMP
    publie = models.BooleanField(default=False)   # BOOLEAN
    
    def __str__(self):
        return self.titre  # Affichage dans l'admin
```

**Ce que Django crée en SQL** :

```sql
CREATE TABLE blog_article (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    auteur VARCHAR(100) NOT NULL,
    date_publication TIMESTAMP DEFAULT NOW(),
    publie BOOLEAN DEFAULT FALSE
);
```

#### Types de champs courants

| Django | SQL | Exemple |
|--------|-----|---------|
| `CharField(max_length=100)` | VARCHAR | Texte court |
| `TextField()` | TEXT | Texte long |
| `IntegerField()` | INTEGER | Nombre entier |
| `FloatField()` | FLOAT | Nombre décimal |
| `BooleanField()` | BOOLEAN | True/False |
| `DateTimeField()` | TIMESTAMP | Date + heure |
| `EmailField()` | VARCHAR | Email validé |
| `ForeignKey()` | FOREIGN KEY | Relation 1-N |
| `OneToOneField()` | UNIQUE + FK | Relation 1-1 |

#### Relations entre models

```python
# Relation One-to-Many (1-N)
class Categorie(models.Model):
    nom = models.CharField(max_length=100)

class Article(models.Model):
    titre = models.CharField(max_length=200)
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE)
    # Un article a UNE catégorie
    # Une catégorie a PLUSIEURS articles

# Utilisation :
categorie = Categorie.objects.create(nom="Tech")
article = Article.objects.create(titre="Django", categorie=categorie)

# Récupérer tous les articles d'une catégorie
articles_tech = categorie.article_set.all()
```

```python
# Relation One-to-One (1-1)
class User(models.Model):
    email = models.EmailField()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField()
    # Un user a UN profile
    # Un profile a UN user

# Utilisation :
user = User.objects.create(email="test@test.com")
profile = Profile.objects.create(user=user, bio="Ma bio")

# Accès direct
print(user.profile.bio)  # "Ma bio"
```

---

### 2️⃣ Les Migrations

Les migrations **transforment vos models en tables SQL**.

```powershell
# Créer les fichiers de migration
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate
```

**Workflow complet** :

```
1. Vous écrivez un model
   ↓
2. makemigrations crée un fichier migration
   ↓
3. migrate exécute le SQL
   ↓
4. Table créée dans PostgreSQL
```

**Exemple de fichier de migration** :

```python
# migrations/0001_initial.py
class Migration(migrations.Migration):
    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('titre', models.CharField(max_length=200)),
                ('contenu', models.TextField()),
            ],
        ),
    ]
```

---

### 3️⃣ L'ORM (Object-Relational Mapping)

L'ORM Django vous permet d'interroger la base de données **avec du Python** au lieu du SQL.

#### Opérations CRUD

```python
# CREATE (Créer)
article = Article.objects.create(
    titre="Mon article",
    contenu="Contenu...",
    auteur="John"
)

# READ (Lire)
tous_articles = Article.objects.all()  # SELECT * FROM article
article = Article.objects.get(id=1)    # SELECT * WHERE id=1
articles = Article.objects.filter(auteur="John")  # SELECT * WHERE auteur='John'

# UPDATE (Modifier)
article = Article.objects.get(id=1)
article.titre = "Nouveau titre"
article.save()  # UPDATE article SET titre='...' WHERE id=1

# DELETE (Supprimer)
article = Article.objects.get(id=1)
article.delete()  # DELETE FROM article WHERE id=1
```

#### Requêtes avancées

```python
# Filtres
Article.objects.filter(publie=True)
Article.objects.filter(titre__contains="Django")  # LIKE '%Django%'
Article.objects.filter(date_publication__year=2025)

# Exclusion
Article.objects.exclude(auteur="John")

# Tri
Article.objects.order_by('-date_publication')  # DESC
Article.objects.order_by('titre')              # ASC

# Limitation
Article.objects.all()[:5]  # LIMIT 5

# Comptage
Article.objects.count()  # COUNT(*)

# Agrégation
from django.db.models import Avg, Count
Article.objects.aggregate(Avg('note'))
```

---

## 🚀 Django REST Framework

### Qu'est-ce que DRF ?

Django REST Framework ajoute à Django la capacité de créer des **APIs REST** facilement.

```
Client (Flutter) → HTTP Request → Django REST → PostgreSQL
                                       ↓
Client (Flutter) ← JSON Response  ← Django REST
```

---

### 1️⃣ Les Serializers

Les serializers **convertissent** les objets Python en JSON (et vice-versa).

```python
# serializers.py
from rest_framework import serializers

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'titre', 'contenu', 'auteur', 'date_publication']
        # Ou : fields = '__all__'
```

**Exemple d'utilisation** :

```python
# Objet Python → JSON (Sérialisation)
article = Article.objects.get(id=1)
serializer = ArticleSerializer(article)
json_data = serializer.data
# Résultat : {"id": 1, "titre": "...", "contenu": "..."}

# JSON → Objet Python (Désérialisation)
data = {"titre": "Nouveau", "contenu": "...", "auteur": "John"}
serializer = ArticleSerializer(data=data)
if serializer.is_valid():
    article = serializer.save()  # Crée l'article en DB
```

#### Validation personnalisée

```python
class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'
    
    def validate_titre(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Le titre doit avoir au moins 5 caractères")
        return value
    
    def validate(self, data):
        # Validation globale
        if data['titre'] == data['auteur']:
            raise serializers.ValidationError("Le titre ne peut pas être identique à l'auteur")
        return data
```

---

### 2️⃣ Les Views (APIView, ViewSet)

#### APIView (Vue basique)

```python
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response

class ArticleListView(APIView):
    def get(self, request):
        """Liste tous les articles"""
        articles = Article.objects.all()
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Créer un nouvel article"""
        serializer = ArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
```

#### ViewSet (Vue avancée)

Un **ViewSet** crée automatiquement plusieurs endpoints :

```python
# views.py
from rest_framework import viewsets

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    
    # Automatiquement créé :
    # GET /articles/           → list()
    # POST /articles/          → create()
    # GET /articles/1/         → retrieve()
    # PUT /articles/1/         → update()
    # PATCH /articles/1/       → partial_update()
    # DELETE /articles/1/      → destroy()
```

#### Actions personnalisées

```python
from rest_framework.decorators import action

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    
    @action(detail=False, methods=['get'])
    def publies(self, request):
        """GET /articles/publies/ - Articles publiés"""
        articles = Article.objects.filter(publie=True)
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publier(self, request, pk=None):
        """POST /articles/1/publier/ - Publier un article"""
        article = self.get_object()
        article.publie = True
        article.save()
        return Response({'status': 'article publié'})
```

---

### 3️⃣ Les URLs

#### Configuration simple

```python
# urls.py
from django.urls import path
from .views import ArticleListView

urlpatterns = [
    path('articles/', ArticleListView.as_view()),
]
```

#### Configuration avec ViewSet (Router)

```python
# urls.py
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')

urlpatterns = router.urls

# Génère automatiquement :
# GET    /articles/              → list()
# POST   /articles/              → create()
# GET    /articles/1/            → retrieve()
# PUT    /articles/1/            → update()
# DELETE /articles/1/            → destroy()
# GET    /articles/publies/      → publies()
# POST   /articles/1/publier/    → publier()
```

---

### 4️⃣ Les Permissions

```python
from rest_framework.permissions import IsAuthenticated, AllowAny

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated]  # Doit être connecté
    
    def get_permissions(self):
        # Lecture publique, écriture authentifiée
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
```

**Permissions courantes** :

| Permission | Description |
|-----------|-------------|
| `AllowAny` | Tout le monde |
| `IsAuthenticated` | Utilisateur connecté |
| `IsAdminUser` | Administrateur |
| `IsAuthenticatedOrReadOnly` | Lecture publique, écriture auth |

---

## 🏗️ Votre projet RespirIA expliqué

### Structure du projet

```
respira-backend-complet/
├── manage.py                      # Commande Django principale
├── respira_project/               # Configuration globale
│   ├── settings/                  # Paramètres (base, dev, prod)
│   ├── urls.py                    # URLs racine
│   └── wsgi.py                    # Serveur WSGI
├── api/v1/                        # API versionnée
│   └── urls.py                    # Routes API
└── apps/                          # Vos applications
    ├── users/                     # Gestion utilisateurs
    │   ├── models.py              # CustomUser, UserProfile
    │   ├── serializers.py         # UserSerializer, etc.
    │   ├── views.py               # UserViewSet, etc.
    │   └── urls.py                # Routes users
    ├── sensors/                   # Données capteurs
    │   ├── models.py              # SensorData, Bracelet
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    └── environment/               # Environnement
        ├── models.py              # AirQuality, Weather
        ├── services/              # Services externes
        │   ├── iqair_service.py
        │   └── weather_service.py
        ├── views.py
        └── urls.py
```

---

### Exemple : App Users

#### 1. Model

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    
    USERNAME_FIELD = 'email'  # Se connecter avec email
    REQUIRED_FIELDS = ['username']

class UserProfile(models.Model):
    PROFILE_TYPES = [
        ('ASTHMATIC', 'Asthmatique'),
        ('PREVENTION', 'Prévention'),
        ('REMISSION', 'Rémission'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPES)
    city = models.CharField(max_length=100, blank=True)
    alerts_enabled = models.BooleanField(default=True)
    days_without_symptoms = models.IntegerField(default=0)
```

#### 2. Serializer

```python
# apps/users/serializers.py
from rest_framework import serializers

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_type', 'city', 'alerts_enabled', 'days_without_symptoms']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'phone', 'profile']
```

#### 3. View

```python
# apps/users/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user  # Retourne l'utilisateur connecté
```

#### 4. URL

```python
# apps/users/urls.py
from django.urls import path

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
]

# api/v1/urls.py
from django.urls import path, include

urlpatterns = [
    path('users/', include('apps.users.urls')),
]

# Résultat : /api/v1/users/me/
```

---

## 💻 Exercices pratiques

### Exercice 1 : Créer une app "Notes"

**Objectif** : Créer une API pour gérer des notes personnelles

```powershell
# Dans le conteneur Docker
docker compose exec web python manage.py startapp notes
```

**1. Créer le model** (`apps/notes/models.py`) :

```python
from django.db import models
from apps.users.models import CustomUser

class Note(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    titre = models.CharField(max_length=200)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    importante = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-date_modification']
    
    def __str__(self):
        return f"{self.titre} - {self.user.email}"
```

**2. Créer le serializer** (`apps/notes/serializers.py`) :

```python
from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'titre', 'contenu', 'date_creation', 'date_modification', 'importante']
        read_only_fields = ['date_creation', 'date_modification']
```

**3. Créer le viewset** (`apps/notes/views.py`) :

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
```

**4. Configurer les URLs** (`apps/notes/urls.py`) :

```python
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet

router = DefaultRouter()
router.register(r'', NoteViewSet, basename='note')

urlpatterns = router.urls
```

**5. Ajouter dans `api/v1/urls.py`** :

```python
urlpatterns = [
    path('users/', include('apps.users.urls')),
    path('sensors/', include('apps.sensors.urls')),
    path('notes/', include('apps.notes.urls')),  # AJOUTER
]
```

**6. Ajouter l'app dans settings** (`respira_project/settings/base.py`) :

```python
INSTALLED_APPS = [
    # ...
    'apps.users',
    'apps.sensors',
    'apps.environment',
    'apps.notes',  # AJOUTER
]
```

**7. Créer et appliquer les migrations** :

```powershell
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

**8. Tester** :

```powershell
# Se connecter
$login = @{
    email = "test@respira.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/auth/login/" -Method Post -Body $login -ContentType "application/json"
$token = $response.access

# Créer une note
$headers = @{Authorization = "Bearer $token"}
$note = @{
    titre = "Ma première note"
    contenu = "Contenu de la note"
    importante = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/notes/" -Method Post -Headers $headers -Body $note -ContentType "application/json"

# Lister mes notes
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/notes/" -Headers $headers
```

---

### Exercice 2 : Ajouter une action personnalisée

**Objectif** : Ajouter `/notes/importantes/` qui liste uniquement les notes importantes

**Modifier `apps/notes/views.py`** :

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class NoteViewSet(viewsets.ModelViewSet):
    # ... code existant ...
    
    @action(detail=False, methods=['get'])
    def importantes(self, request):
        """GET /api/v1/notes/importantes/"""
        notes = self.get_queryset().filter(importante=True)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)
```

**Tester** :

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/notes/importantes/" -Headers $headers
```

---

## 📚 Ressources supplémentaires

### Documentation officielle

- **Django** : https://docs.djangoproject.com/
- **Django REST Framework** : https://www.django-rest-framework.org/
- **Simple JWT** : https://django-rest-framework-simplejwt.readthedocs.io/

### Commandes Django utiles

```powershell
# Dans Docker
docker compose exec web python manage.py <commande>

# Créer une nouvelle app
python manage.py startapp nom_app

# Créer migrations
python manage.py makemigrations

# Appliquer migrations
python manage.py migrate

# Créer superuser
python manage.py createsuperuser

# Shell interactif
python manage.py shell

# Shell avec IPython (meilleur)
python manage.py shell_plus

# Collecter fichiers statiques
python manage.py collectstatic

# Voir les migrations
python manage.py showmigrations

# Annuler une migration
python manage.py migrate app_name 0001  # Retour à migration 0001
```

### Shell Django (pour tester)

```powershell
docker compose exec web python manage.py shell
```

```python
# Dans le shell
from apps.users.models import CustomUser
from apps.sensors.models import SensorData

# Lister tous les users
users = CustomUser.objects.all()
for user in users:
    print(f"{user.email} - {user.profile.profile_type}")

# Créer des données
user = CustomUser.objects.get(email='test@respira.com')
SensorData.objects.create(
    user=user,
    spo2=98,
    heart_rate=75,
    temperature=36.8
)

# Statistiques
from django.db.models import Avg
avg_spo2 = SensorData.objects.filter(user=user).aggregate(Avg('spo2'))
print(f"SpO2 moyen : {avg_spo2['spo2__avg']}")
```

---

## 🎯 Résumé : Créer une API en 5 étapes

1. **Model** → Structure de la base de données
2. **Serializer** → Conversion Python ↔ JSON
3. **View** → Logique métier (APIView ou ViewSet)
4. **URL** → Routing des endpoints
5. **Permissions** → Contrôle d'accès

**Flow complet** :

```
Client → URL → View → Serializer → Model → PostgreSQL
                  ↓
Client ← JSON ← Serializer ← Model
```

---

**Vous avez maintenant les bases pour comprendre et créer des APIs Django REST ! 🚀**
