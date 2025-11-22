# 🎯 API ENDPOINTS - Guide Complet pour Frontend Flutter

## 🌐 URL de Base

```dart
// Développement Local
const String BASE_URL = 'http://localhost:8000/api/v1';

// Android Emulator
const String BASE_URL = 'http://10.0.2.2:8000/api/v1';

// iOS Simulator
const String BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Production (après déploiement)
const String BASE_URL = 'https://votre-api.com/api/v1';
```

---

## 🔐 1. AUTHENTIFICATION

### 📝 Inscription (Register)

```dart
POST /users/auth/register/

// Headers
Content-Type: application/json

// Body
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "password_confirm": "password123",
  "profile_type": "ASTHMATIC",  // ou "PREVENTION" ou "REMISSION"
  "first_name": "John",         // optionnel
  "last_name": "Doe"            // optionnel
}

// Réponse (201 Created)
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "profile_type": "ASTHMATIC",
      "city": "Abidjan",
      "alerts_enabled": true
    }
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 🔑 Connexion (Login)

```dart
POST /users/auth/login/

// Headers
Content-Type: application/json

// Body
{
  "email": "user@example.com",
  "password": "password123"
}

// Réponse (200 OK)
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 🔄 Rafraîchir le Token

```dart
POST /users/auth/refresh/

// Headers
Content-Type: application/json

// Body
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Réponse (200 OK)
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 2. PROFIL UTILISATEUR

### 📋 Obtenir le profil utilisateur

```dart
GET /users/me/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Réponse (200 OK)
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "",
  "profile": {
    "profile_type": "ASTHMATIC",
    "date_of_birth": "1990-01-01",
    "city": "Abidjan",
    "country": "CI",
    "alerts_enabled": true,
    "days_without_symptoms": 5
  },
  "created_at": "2025-11-20T10:00:00Z"
}
```

### ✏️ Modifier le profil utilisateur

```dart
PATCH /users/me/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Body (tous les champs sont optionnels)
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+225 01 02 03 04 05"
}

// Réponse (200 OK) - Profil complet mis à jour
```

### 📝 Obtenir les détails du profil

```dart
GET /users/me/profile/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
{
  "profile_type": "ASTHMATIC",
  "date_of_birth": "1990-01-01",
  "city": "Abidjan",
  "country": "CI",
  "alerts_enabled": true,
  "days_without_symptoms": 5
}
```

### ✏️ Modifier les détails du profil

```dart
PATCH /users/me/profile/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Body (tous les champs sont optionnels)
{
  "city": "Yamoussoukro",
  "alerts_enabled": false,
  "days_without_symptoms": 10
}

// Réponse (200 OK) - Détails du profil mis à jour
```

---

## 📊 3. DONNÉES CAPTEURS (SENSORS)

### 📱 Liste des bracelets

```dart
GET /sensors/devices/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
[
  {
    "id": 1,
    "device_id": "BR-001",
    "device_name": "Mon Bracelet",
    "battery_level": 85,
    "is_connected": true,
    "last_sync": "2025-11-20T13:45:00Z",
    "created_at": "2025-11-01T10:00:00Z"
  }
]
```

### ➕ Ajouter un bracelet

```dart
POST /sensors/devices/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Body
{
  "device_id": "BR-002",
  "device_name": "Bracelet 2"
}

// Réponse (201 Created)
```

### 📤 Envoyer des données capteurs

```dart
POST /sensors/data/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Body
{
  "timestamp": "2025-11-20T14:30:00Z",
  "spo2": 97,                        // Saturation oxygène (70-100%)
  "heart_rate": 72,                  // Fréquence cardiaque (30-220 BPM)
  "respiratory_rate": 16,            // Fréquence respiratoire (5-60/min)
  "temperature": 36.7,               // Température (35-42°C)
  "activity_level": "REST",          // REST, LIGHT, MODERATE, INTENSE
  "steps": 5000,                     // Nombre de pas
  "risk_score": 25                   // Score de risque (0-100)
}

// Réponse (201 Created)
{
  "id": 123,
  "timestamp": "2025-11-20T14:30:00Z",
  "spo2": 97,
  "heart_rate": 72,
  "respiratory_rate": 16,
  "temperature": 36.7,
  "activity_level": "REST",
  "steps": 5000,
  "risk_score": 25,
  "risk_level": "LOW",               // Calculé automatiquement
  "created_at": "2025-11-20T14:30:15Z"
}
```

### 📥 Récupérer l'historique des données (paginé)

```dart
GET /sensors/data/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Query Parameters (optionnels)
?page=1                               // Numéro de page
&page_size=20                         // Nombre d'éléments par page

// Réponse (200 OK)
{
  "count": 150,                       // Total d'éléments
  "next": "http://localhost:8000/api/v1/sensors/data/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "timestamp": "2025-11-20T14:30:00Z",
      "spo2": 97,
      "heart_rate": 72,
      "risk_score": 25,
      "risk_level": "LOW"
    },
    // ... 19 autres éléments
  ]
}
```

### 🔝 Dernières données capteurs

```dart
GET /sensors/data/latest/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
{
  "id": 123,
  "timestamp": "2025-11-20T14:30:00Z",
  "spo2": 97,
  "heart_rate": 72,
  "respiratory_rate": 16,
  "temperature": 36.7,
  "activity_level": "REST",
  "steps": 5000,
  "risk_score": 25,
  "risk_level": "LOW"
}
```

### ⚠️ Score de risque actuel

```dart
GET /sensors/data/risk_score/        // ⚠️ ATTENTION: underscore pas tiret !

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
{
  "risk_score": 25,
  "risk_level": "LOW",                // LOW, MODERATE, HIGH, CRITICAL
  "timestamp": "2025-11-20T14:30:00Z"
}
```

### 📈 Statistiques

```dart
GET /sensors/data/stats/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Query Parameters (optionnel)
?period=24h                           // 24h, 7d, 30d

// Réponse (200 OK)
{
  "period": "24h",
  "stats": {
    "avg_spo2": 96.5,
    "min_spo2": 93,
    "avg_heart_rate": 75.2,
    "max_heart_rate": 120
  }
}
```

---

## 🌍 4. ENVIRONNEMENT

### 🌫️ Qualité de l'air actuelle

```dart
GET /environment/air-quality/current/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Query Parameters (optionnel)
?city=Abidjan                         // Si omis, utilise la ville du profil

// Réponse (200 OK)
{
  "id": 4,
  "city": "Abidjan",
  "timestamp": "2025-11-20T13:47:19Z",
  "aqi": 40,                          // Air Quality Index
  "aqi_level": "GOOD",                // GOOD, MODERATE, UNHEALTHY, HAZARDOUS
  "pm25": 25.68,                      // Particules fines PM2.5
  "created_at": "2025-11-20T13:47:19Z"
}
```

### ☁️ Météo actuelle

```dart
GET /environment/weather/current/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Query Parameters (optionnel)
?city=Abidjan                         // Si omis, utilise la ville du profil

// Réponse (200 OK)
{
  "id": 3,
  "city": "Abidjan",
  "timestamp": "2025-11-20T13:47:19Z",
  "temperature": 29.98,               // En degrés Celsius
  "humidity": 74,                     // Humidité en %
  "description": "partiellement nuageux",
  "created_at": "2025-11-20T13:47:19Z"
}
```

---

## 🎨 5. CODES COULEURS POUR L'INTERFACE

### Risk Level (Niveau de risque)

```dart
const Map<String, Color> riskColors = {
  'LOW': Color(0xFF4CAF50),          // Vert
  'MODERATE': Color(0xFFFFC107),     // Jaune
  'HIGH': Color(0xFFFF9800),         // Orange
  'CRITICAL': Color(0xFFF44336),     // Rouge
};
```

### AQI Level (Qualité de l'air)

```dart
const Map<String, Color> aqiColors = {
  'GOOD': Color(0xFF4CAF50),         // Vert (0-50)
  'MODERATE': Color(0xFFFFC107),     // Jaune (51-100)
  'UNHEALTHY': Color(0xFFFF9800),    // Orange (101-150)
  'HAZARDOUS': Color(0xFFF44336),    // Rouge (>150)
};
```

---

## 📋 6. EXEMPLE COMPLET FLUTTER

### Service API complet

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1';
  final Dio _dio = Dio();
  final _storage = FlutterSecureStorage();
  
  ApiService() {
    _dio.options.baseUrl = baseUrl;
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }
  
  // ===== AUTHENTIFICATION =====
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/users/auth/login/', data: {
      'email': email,
      'password': password,
    });
    
    // Sauvegarder les tokens
    await _storage.write(key: 'access_token', value: response.data['access']);
    await _storage.write(key: 'refresh_token', value: response.data['refresh']);
    
    return response.data;
  }
  
  Future<Map<String, dynamic>> register({
    required String email,
    required String username,
    required String password,
    required String passwordConfirm,
    required String profileType,
  }) async {
    final response = await _dio.post('/users/auth/register/', data: {
      'email': email,
      'username': username,
      'password': password,
      'password_confirm': passwordConfirm,
      'profile_type': profileType,
    });
    
    // Sauvegarder les tokens
    await _storage.write(key: 'access_token', value: response.data['tokens']['access']);
    await _storage.write(key: 'refresh_token', value: response.data['tokens']['refresh']);
    
    return response.data;
  }
  
  // ===== PROFIL =====
  
  Future<Map<String, dynamic>> getProfile() async {
    final response = await _dio.get('/users/me/');
    return response.data;
  }
  
  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.patch('/users/me/profile/', data: data);
    return response.data;
  }
  
  // ===== CAPTEURS =====
  
  Future<Map<String, dynamic>> sendSensorData({
    required DateTime timestamp,
    int? spo2,
    int? heartRate,
    int? respiratoryRate,
    double? temperature,
    String? activityLevel,
    int? steps,
    int? riskScore,
  }) async {
    final response = await _dio.post('/sensors/data/', data: {
      'timestamp': timestamp.toIso8601String(),
      'spo2': spo2,
      'heart_rate': heartRate,
      'respiratory_rate': respiratoryRate,
      'temperature': temperature,
      'activity_level': activityLevel,
      'steps': steps,
      'risk_score': riskScore,
    });
    return response.data;
  }
  
  Future<Map<String, dynamic>> getLatestData() async {
    final response = await _dio.get('/sensors/data/latest/');
    return response.data;
  }
  
  Future<Map<String, dynamic>> getRiskScore() async {
    final response = await _dio.get('/sensors/data/risk_score/');
    return response.data;
  }
  
  Future<Map<String, dynamic>> getStats({String period = '24h'}) async {
    final response = await _dio.get('/sensors/data/stats/', 
      queryParameters: {'period': period}
    );
    return response.data;
  }
  
  // ===== ENVIRONNEMENT =====
  
  Future<Map<String, dynamic>> getAirQuality({String? city}) async {
    final response = await _dio.get('/environment/air-quality/current/',
      queryParameters: city != null ? {'city': city} : null
    );
    return response.data;
  }
  
  Future<Map<String, dynamic>> getWeather({String? city}) async {
    final response = await _dio.get('/environment/weather/current/',
      queryParameters: city != null ? {'city': city} : null
    );
    return response.data;
  }
}
```

---

## 🧪 7. TESTER VOS ENDPOINTS

### Avec PowerShell

```powershell
# Connexion
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/auth/login/" `
  -Method Post `
  -Body (@{email="test@respira.com"; password="TestPass123!"} | ConvertTo-Json) `
  -ContentType "application/json"

$headers = @{Authorization = "Bearer $($login.access)"}

# Profil
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/me/" -Headers $headers

# Dernières données
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sensors/data/latest/" -Headers $headers

# Score de risque
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sensors/data/risk_score/" -Headers $headers

# Qualité de l'air
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/environment/air-quality/current/?city=Abidjan" -Headers $headers

# Météo
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/environment/weather/current/?city=Abidjan" -Headers $headers
```

---

## 📚 8. DOCUMENTATION INTERACTIVE

### Swagger UI

Accédez à la documentation interactive complète :

```
http://localhost:8000/swagger/
```

Vous pouvez :
- ✅ Voir tous les endpoints
- ✅ Voir les schémas de données
- ✅ Tester les endpoints directement
- ✅ Voir les exemples de réponses

---

## ⚠️ 9. POINTS IMPORTANTS

### URLs à retenir

```
✅ /sensors/data/risk_score/  (avec underscore)
❌ /sensors/data/risk-score/  (avec tiret - NE FONCTIONNE PAS)
```

### Tokens JWT

- **Access token** : Valide 1 heure
- **Refresh token** : Valide 7 jours
- Stockez-les de manière sécurisée (flutter_secure_storage)

### Dates

Format ISO 8601 uniquement :
```
2025-11-20T14:30:00Z
```

### Cache

- Air Quality : 1 heure
- Weather : 30 minutes

---

## 🎯 RÉSUMÉ RAPIDE

| Fonctionnalité | Endpoint | Méthode |
|---------------|----------|---------|
| Inscription | `/users/auth/register/` | POST |
| Connexion | `/users/auth/login/` | POST |
| Profil | `/users/me/` | GET/PATCH |
| Données capteurs | `/sensors/data/` | POST |
| Dernières données | `/sensors/data/latest/` | GET |
| Score de risque | `/sensors/data/risk_score/` | GET |
| Statistiques | `/sensors/data/stats/` | GET |
| Qualité air | `/environment/air-quality/current/` | GET |
| Météo | `/environment/weather/current/` | GET |

**Tous les endpoints nécessitent** `Authorization: Bearer <token>` **sauf** `/auth/register/` et `/auth/login/`

---

**Votre backend est prêt ! Commencez à développer votre app Flutter ! 🚀**
