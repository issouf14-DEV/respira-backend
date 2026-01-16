# 📱 Configuration Flutter pour RespirIA Backend

## ✅ Configuration Backend Optimisée

Le backend est configuré pour faciliter l'intégration Flutter :

### CORS
- ✅ Toutes les origines autorisées
- ✅ Credentials autorisés
- ✅ Tous les headers nécessaires
- ✅ Cache preflight 24h

### Cookies & CSRF
- ✅ CSRF assoupli pour mobile
- ✅ SameSite=None pour cross-origin
- ✅ Cookies accessibles depuis Flutter

---

## 🔑 Authentification JWT

### 1. Inscription
```dart
POST /api/v1/users/auth/register/

Body:
{
  "username": "user123",
  "email": "user@example.com",
  "password": "motdepasse",
  "password_confirm": "motdepasse",
  "profile_type": "PREVENTION",  // ASTHMATIC, PREVENTION, ou REMISSION
  "first_name": "Jean",          // optionnel
  "last_name": "Dupont"           // optionnel
}

Response 201:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user123"
  },
  "tokens": {
    "refresh": "eyJ0eXAi...",
    "access": "eyJ0eXAi..."
  }
}
```

### 2. Connexion
```dart
POST /api/v1/users/auth/login/

Body:
{
  "email": "user@example.com",
  "password": "motdepasse"
}

Response 200:
{
  "refresh": "eyJ0eXAi...",
  "access": "eyJ0eXAi..."
}
```

### 3. Rafraîchir le token
```dart
POST /api/v1/users/auth/refresh/

Body:
{
  "refresh": "eyJ0eXAi..."
}

Response 200:
{
  "access": "nouveau_token..."
}
```

---

## 📦 Package Flutter Requis

```yaml
dependencies:
  http: ^1.1.0
  shared_preferences: ^2.2.0  # Pour stocker le token
```

---

## 💡 Service API Flutter

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://respira-backend.onrender.com/api/v1';
  
  String? _accessToken;
  String? _refreshToken;
  
  // Initialiser les tokens depuis le storage
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString('access_token');
    _refreshToken = prefs.getString('refresh_token');
  }
  
  // Sauvegarder les tokens
  Future<void> _saveTokens(String access, String refresh) async {
    _accessToken = access;
    _refreshToken = refresh;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', access);
    await prefs.setString('refresh_token', refresh);
  }
  
  // Inscription
  Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String password,
    required String profileType,
    String? firstName,
    String? lastName,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/auth/register/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
        'password_confirm': password,
        'profile_type': profileType,
        if (firstName != null) 'first_name': firstName,
        if (lastName != null) 'last_name': lastName,
      }),
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await _saveTokens(
        data['tokens']['access'],
        data['tokens']['refresh'],
      );
      return data;
    } else {
      throw Exception('Inscription échouée: ${response.body}');
    }
  }
  
  // Connexion
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/auth/login/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveTokens(data['access'], data['refresh']);
      return data;
    } else {
      throw Exception('Connexion échouée: ${response.body}');
    }
  }
  
  // Rafraîchir le token
  Future<void> refreshToken() async {
    if (_refreshToken == null) throw Exception('Pas de refresh token');
    
    final response = await http.post(
      Uri.parse('$baseUrl/users/auth/refresh/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh': _refreshToken}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      _accessToken = data['access'];
      await prefs.setString('access_token', data['access']);
    } else {
      throw Exception('Rafraîchissement échoué');
    }
  }
  
  // Requête GET authentifiée
  Future<http.Response> get(String endpoint) async {
    try {
      var response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Authorization': 'Bearer $_accessToken',
          'Content-Type': 'application/json',
        },
      );
      
      // Si token expiré, rafraîchir et réessayer
      if (response.statusCode == 401) {
        await refreshToken();
        response = await http.get(
          Uri.parse('$baseUrl$endpoint'),
          headers: {
            'Authorization': 'Bearer $_accessToken',
            'Content-Type': 'application/json',
          },
        );
      }
      
      return response;
    } catch (e) {
      throw Exception('Erreur GET: $e');
    }
  }
  
  // Requête POST authentifiée
  Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    try {
      var response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Authorization': 'Bearer $_accessToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(body),
      );
      
      // Si token expiré, rafraîchir et réessayer
      if (response.statusCode == 401) {
        await refreshToken();
        response = await http.post(
          Uri.parse('$baseUrl$endpoint'),
          headers: {
            'Authorization': 'Bearer $_accessToken',
            'Content-Type': 'application/json',
          },
          body: jsonEncode(body),
        );
      }
      
      return response;
    } catch (e) {
      throw Exception('Erreur POST: $e');
    }
  }
  
  // Déconnexion
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    _accessToken = null;
    _refreshToken = null;
  }
  
  // Vérifier si connecté
  bool get isAuthenticated => _accessToken != null;
}
```

---

## 🎯 Exemple d'utilisation

```dart
// Initialiser le service
final apiService = ApiService();
await apiService.init();

// Inscription
try {
  await apiService.register(
    username: 'KOUASSI',
    email: 'rkouassi@gmail.com',
    password: 'motdepasse123',
    profileType: 'PREVENTION',
  );
  print('Inscription réussie !');
} catch (e) {
  print('Erreur: $e');
}

// Connexion
try {
  await apiService.login('rkouassi@gmail.com', 'motdepasse123');
  print('Connecté !');
} catch (e) {
  print('Erreur: $e');
}

// Utiliser le chatbot
try {
  final response = await apiService.post('/chatbot/chat/', {
    'message': 'C\'est quoi l\'asthme ?',
  });
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    print('Réponse: ${data['response']}');
  }
} catch (e) {
  print('Erreur: $e');
}
```

---

## ⚠️ Notes Importantes

1. **Token Expiration**
   - Access token expire après 60 minutes
   - Refresh token expire après 7 jours
   - Le service gère automatiquement le rafraîchissement

2. **Profile Types**
   - `ASTHMATIC` - Patient asthmatique
   - `PREVENTION` - Prévention
   - `REMISSION` - Rémission
   - **IMPORTANT** : Toujours en MAJUSCULES !

3. **Erreurs Courantes**
   - 400 : Données invalides
   - 401 : Non authentifié / Token expiré
   - 403 : Accès refusé
   - 500 : Erreur serveur

4. **Serveur Render**
   - Le serveur s'endort après 15 min d'inactivité
   - Première requête peut prendre 30-60 secondes
   - Prévoir un indicateur de chargement

---

## 🚀 Endpoints Disponibles

### Utilisateurs
- `POST /users/auth/register/` - Inscription
- `POST /users/auth/login/` - Connexion
- `POST /users/auth/refresh/` - Rafraîchir token
- `GET /users/me/` - Profil utilisateur
- `PUT /users/me/profile/` - Modifier profil

### Chatbot
- `POST /chatbot/chat/` - Envoyer message
- `GET /chatbot/history/` - Historique

### Capteurs
- `GET /sensors/data/` - Données capteurs
- `POST /sensors/data/` - Ajouter données

### Environnement
- `GET /environment/air-quality/` - Qualité air
- `GET /environment/weather/` - Météo

---

**Backend prêt pour Flutter ! 🎉**
