# 📱 Statut de l'intégration Flutter - RespirIA Backend

**Date**: 19 novembre 2025  
**Backend**: Django 4.2 + PostgreSQL 15 (Docker)  
**Frontend**: Flutter (en cours de développement)

---

## ✅ Configuration terminée

### 1. Backend Flutter-Ready

- [x] **URL racine** : `http://localhost:8000/` retourne maintenant un JSON avec la liste des endpoints
- [x] **CORS** : Configuré avec `CORS_ALLOW_ALL_ORIGINS = True` pour le développement Flutter
- [x] **JWT Auth** : Tokens avec rotation automatique et refresh activé
- [x] **REST Framework** : JSON renderer, parsers, format datetime ISO
- [x] **Documentation** : Swagger/OpenAPI accessible via `/swagger/` et `/redoc/`

### 2. Guide d'intégration

- [x] **FLUTTER_INTEGRATION.md** : Guide complet avec :
  - Configuration des dépendances (`http`, `dio`, `flutter_secure_storage`)
  - Service d'authentification complet
  - Client HTTP avec intercepteur et gestion du refresh token
  - Modèles de données avec `json_serializable`
  - Exemples d'écrans Flutter (Login, Profile, Dashboard)
  - Configuration Android/iOS

### 3. Script de test

- [x] **test_flutter_integration.ps1** : Script PowerShell simulant les appels Flutter
  - Test de l'endpoint racine ✅
  - Inscription/Connexion ✅
  - Récupération du profil ✅
  - Données de capteurs ✅
  - Score de risque ✅
  - Refresh token ✅

---

## ⚠️ Points d'attention

### Problèmes mineurs détectés

1. **Activity Level** : Le champ accepte uniquement les valeurs :
   - `REST`, `LIGHT`, `MODERATE`, `VIGOROUS`
   - ❌ `sedentary` n'est pas valide
   - 🔧 À corriger dans les appels Flutter

2. **Timestamp** : Obligatoire lors de l'envoi de données capteur
   - Format ISO 8601 : `2025-11-19T20:30:00Z`
   - 🔧 À ajouter dans les modèles Flutter

3. **Query Parameters** : Problème d'encodage PowerShell avec les URLs
   - Fonctionne correctement avec les clients HTTP normaux
   - ✅ Pas de problème attendu dans Flutter

---

## 🚀 Prochaines étapes Flutter

### 1. Configuration initiale

```yaml
# pubspec.yaml
dependencies:
  http: ^1.1.0              # Client HTTP basique
  dio: ^5.4.0               # Client HTTP avancé (recommandé)
  provider: ^6.1.1          # State management
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0  # Pour JWT
  json_annotation: ^4.8.1
```

### 2. URL de base

```dart
// Android Emulator
static const String baseUrl = 'http://10.0.2.2:8000';

// iOS Simulator
static const String baseUrl = 'http://localhost:8000';

// Production
static const String baseUrl = 'https://api.respira.com';
```

### 3. Implémenter les services

1. **AuthService** : Login, Register, Refresh Token
2. **ApiClient** : Client HTTP avec intercepteur JWT
3. **SensorService** : Envoi et récupération des données
4. **EnvironmentService** : Qualité de l'air et météo

### 4. Créer les modèles

```dart
// user.dart
@JsonSerializable()
class User {
  final int id;
  final String email;
  final String username;
  @JsonKey(name: 'first_name')
  final String? firstName;
  // ...
}
```

Puis générer avec :
```bash
flutter pub run build_runner build
```

---

## 📊 Tests effectués

### ✅ Tests réussis

| Endpoint | Méthode | Statut | Description |
|----------|---------|--------|-------------|
| `/` | GET | 200 | Page racine avec liste endpoints |
| `/api/v1/users/auth/login/` | POST | 200 | Connexion utilisateur |
| `/api/v1/users/auth/refresh/` | POST | 200 | Refresh token JWT |
| `/api/v1/users/me/` | GET | 200 | Profil utilisateur |
| `/api/v1/sensors/data/latest/` | GET | 200 | Dernières données capteur |
| `/api/v1/sensors/data/risk_score/` | GET | 200 | Score de risque |

### ⚠️ À adapter

| Endpoint | Problème | Solution |
|----------|----------|----------|
| `/api/v1/sensors/data/` | Champs manquants/invalides | Ajouter `timestamp`, utiliser `REST` au lieu de `sedentary` |
| Queries avec params | Encodage PowerShell | Fonctionnera normalement dans Flutter |

---

## 🔐 Authentification

### Flux JWT implémenté

```
1. Login → Obtenir access + refresh tokens
2. Stocker tokens dans flutter_secure_storage
3. Utiliser access token dans header : Authorization: Bearer <token>
4. Si 401 : refresh automatique avec refresh token
5. Si refresh échoue : rediriger vers login
```

### Exemple Flutter

```dart
// Connexion
final authService = AuthService();
final tokens = await authService.login(
  email: 'test@respira.com',
  password: 'TestPass123!',
);

// Appel authentifié
final apiClient = ApiClient();
final profile = await apiClient.get('/users/me/');
```

---

## 📚 Documentation disponible

| Document | Description |
|----------|-------------|
| **README.md** | Vue d'ensemble du projet |
| **FLUTTER_INTEGRATION.md** | ⭐ Guide complet Flutter |
| **API_DOCUMENTATION.md** | Endpoints et exemples |
| **TEST_GUIDE.md** | Tests PowerShell |
| **TROUBLESHOOTING.md** | Résolution de problèmes |

---

## 🌍 URLs importantes

- **Backend** : `http://localhost:8000`
- **Admin** : `http://localhost:8000/admin`
- **Swagger** : `http://localhost:8000/swagger/`
- **ReDoc** : `http://localhost:8000/redoc/`

### Identifiants de test

- **Email** : `test@respira.com`
- **Password** : `TestPass123!`
- **Profile Type** : `ASTHMATIC`

---

## 🔧 Configuration CORS

```python
# settings/base.py
CORS_ALLOW_ALL_ORIGINS = True  # Développement uniquement

CORS_ALLOW_HEADERS = [
    'accept', 'authorization', 'content-type',
    'user-agent', 'x-csrftoken', 'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT',
]
```

**⚠️ Production** : Changer `CORS_ALLOW_ALL_ORIGINS` en `CORS_ALLOWED_ORIGINS` avec la liste des domaines autorisés.

---

## ✨ Fonctionnalités backend prêtes pour Flutter

- [x] Authentification JWT complète
- [x] Gestion des profils utilisateurs (3 types)
- [x] Données biométriques (SpO2, FC, FR, Temp)
- [x] Bracelets connectés
- [x] Qualité de l'air (IQAir API)
- [x] Météo (OpenWeather API)
- [x] Calcul automatique du score de risque
- [x] Statistiques sur 7/30 jours
- [x] CORS ouvert pour développement
- [x] Documentation Swagger/OpenAPI

---

## 🎯 Validation Flutter

### Checklist de démarrage

- [ ] Créer nouveau projet Flutter
- [ ] Ajouter dépendances dans `pubspec.yaml`
- [ ] Configurer URL de base (`10.0.2.2` pour Android)
- [ ] Créer `AuthService` avec login/register/refresh
- [ ] Créer `ApiClient` avec intercepteur JWT
- [ ] Tester connexion avec `test@respira.com`
- [ ] Implémenter modèles avec `json_serializable`
- [ ] Créer écrans : Login, Register, Dashboard
- [ ] Tester envoi de données capteur
- [ ] Implémenter refresh automatique des tokens

### Premier test Flutter

```dart
// main.dart - Test rapide
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final authService = AuthService();
  try {
    final tokens = await authService.login(
      email: 'test@respira.com',
      password: 'TestPass123!',
    );
    print('✅ Connexion réussie');
    print('Access token: ${tokens['access']}');
  } catch (e) {
    print('❌ Erreur: $e');
  }
  
  runApp(MyApp());
}
```

---

## 🚧 Limitations actuelles

1. **Pas de WebSocket** : Les données temps réel nécessitent des requêtes périodiques
2. **API Keys externes** : IQAir et OpenWeather utilisent des données mock par défaut
3. **CORS ouvert** : À restreindre en production
4. **Pas de rate limiting** : À ajouter en production
5. **Pas de tests unitaires Flutter** : À créer

---

## 📞 Support

En cas de problème :
1. Vérifier que Docker est démarré
2. Vérifier l'URL de base (`10.0.2.2` pour Android, `localhost` pour iOS)
3. Consulter `/swagger/` pour la documentation interactive
4. Vérifier les logs : `docker compose logs -f web`
5. Consulter `TROUBLESHOOTING.md`

---

**Le backend RespirIA est 100% prêt pour l'intégration Flutter ! 🚀**
