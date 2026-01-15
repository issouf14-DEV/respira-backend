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

### 📤 Envoyer des données capteurs (AMÉLIORÉ)

```dart
POST /sensors/data/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

// Body - TOUTES LES NOUVELLES FEATURES ⭐⭐⭐⭐⭐
{
  "timestamp": "2025-12-02T14:30:00Z",
  // ⭐⭐⭐⭐⭐ CRITIQUES
  "spo2": 97,                        // Saturation oxygène (70-100%)
  "respiratory_rate": 16,            // Fréquence respiratoire (10-40/min)
  "aqi": 45,                         // Air Quality Index (0-500)
  
  // ⭐⭐⭐⭐ IMPORTANTES
  "heart_rate": 72,                  // Fréquence cardiaque (30-220 BPM)
  "smoke_detected": false,           // Fumée détectée (boolean)
  "pollen_level": "MEDIUM",          // LOW, MEDIUM, HIGH
  
  // ⭐⭐⭐ MODÉRÉES  
  "temperature": 36.7,               // Température (°C)
  "humidity": 65,                    // Humidité (%)
  "activity_level": "WALK",          // REST, WALK, RUN
  "steps": 5000                      // Nombre de pas
}

// Réponse (201 Created) - ENRICHIE
{
  "id": 123,
  "timestamp": "2025-12-02T14:30:00Z",
  "spo2": 97,
  "respiratory_rate": 16,
  "aqi": 45,
  "heart_rate": 72,
  "smoke_detected": false,
  "pollen_level": "MEDIUM",
  "temperature": 36.7,
  "humidity": 65,
  "activity_level": "WALK",
  "steps": 5000,
  "hour_of_day": 14,                 // Calculé automatiquement
  "risk_score": 15,                  // Calculé intelligemment
  "risk_level": "LOW",               // AUTO: LOW, MODERATE, HIGH, CRITICAL
  "created_at": "2025-12-02T14:30:15Z"
}
```

### 🏥 Résumé de santé intelligent (NOUVEAU)

```dart
GET /sensors/data/health_summary/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
{
  "health_score": 85,                // Score global (0-100)
  "health_level": "GOOD",            // EXCELLENT, GOOD, FAIR, POOR
  "warnings": [
    "Qualité de l'air médiocre: AQI 120"
  ],
  "latest_data": {
    "spo2": 96,
    "respiratory_rate": 18,
    "aqi": 120,
    "risk_score": 25,
    "risk_level": "LOW"
  },
  "readings_24h": 144               // Nombre de mesures sur 24h
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

### 📈 Statistiques avancées (AMÉLIORÉ)

```dart
GET /sensors/data/stats/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Query Parameters (optionnel)
?period=24h                           // 24h, 7d, 30d

// Réponse (200 OK) - ENRICHIE
{
  "period": "24h",
  "stats": {
    // ⭐⭐⭐⭐⭐ SpO2
    "avg_spo2": 96.5,
    "min_spo2": 93,
    "max_spo2": 99,
    
    // ⭐⭐⭐⭐⭐ Fréquence respiratoire  
    "avg_respiratory_rate": 16.2,
    
    // ⭐⭐⭐⭐⭐ Qualité de l'air
    "avg_aqi": 65.3,
    "max_aqi": 120,
    
    // ⭐⭐⭐⭐ Fréquence cardiaque
    "avg_heart_rate": 75.2,
    "min_heart_rate": 58,
    "max_heart_rate": 120,
    
    // Score de risque
    "avg_risk_score": 22.5
  },
  "risk_distribution": [
    {"risk_level": "LOW", "count": 142},
    {"risk_level": "MODERATE", "count": 2}
  ],
  "total_readings": 144
}
```

---

## 🚨 5. ALERTES ET MONITORING (NOUVEAU)

### 📋 Liste des alertes

```dart
GET /sensors/alerts/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
[
  {
    "id": 1,
    "alert_type": "LOW_SPO2",
    "severity": "CRITICAL",
    "message": "SpO2 critique détectée: 89% (normal: >95%)",
    "is_read": false,
    "is_dismissed": false,
    "timestamp": "2025-12-02T14:30:00Z"
  },
  {
    "id": 2,
    "alert_type": "POOR_AIR_QUALITY", 
    "severity": "WARNING",
    "message": "Qualité de l'air dangereuse: AQI 180 (bon: <50)",
    "is_read": true,
    "is_dismissed": false,
    "timestamp": "2025-12-02T13:45:00Z"
  }
]
```

### 🔔 Alertes non lues

```dart
GET /sensors/alerts/unread/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK) - Seulement les alertes non lues
[
  {
    "id": 1,
    "alert_type": "SMOKE_DETECTED",
    "severity": "CRITICAL",
    "message": "Fumée détectée dans votre environnement!",
    "timestamp": "2025-12-02T14:30:00Z"
  }
]
```

### ✅ Marquer une alerte comme lue

```dart
POST /sensors/alerts/{id}/mark_read/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
{
  "status": "marked_read"
}
```

---

## 📊 6. ANALYTICS AVANCÉES (NOUVEAU)

### 📈 Données d'analyse temporelle

```dart
GET /sensors/analytics/

// Headers  
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Réponse (200 OK)
[
  {
    "id": 1,
    "timestamp": "2025-12-02T14:00:00Z",
    "spo2_variation_1h": -2.5,        // Variation SpO2 sur 1h
    "spo2_avg_1h": 95.8,              // Moyenne SpO2 sur 1h
    "spo2_min_1h": 93,                // Min SpO2 sur 1h  
    "aqi_avg_3h": 75.2,               // AQI moyen sur 3h
    "aqi_avg_6h": 68.9,               // AQI moyen sur 6h
    "aqi_avg_24h": 62.3,              // AQI moyen sur 24h
    "heart_rate_avg_1h": 78.5,        // FC moyenne sur 1h
    "heart_rate_variability": 12.3,   // Variabilité FC
    "respiratory_rate_avg_1h": 16.8,  // FR moyenne sur 1h
    "respiratory_health_score": 82,   // Score santé respiratoire (0-100)
    "environmental_risk_score": 35    // Score risque environnemental (0-100)
  }
]
```

---

## 🌍 7. ENVIRONNEMENT AMÉLIORÉ

### 🌫️ Qualité de l'air actuelle (ENRICHIE)

```dart
GET /environment/air-quality/current/

// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Query Parameters (optionnel)
?city=Abidjan                         // Si omis, utilise la ville du profil

// Réponse (200 OK) - ENRICHIE
{
  "id": 4,
  "city": "Abidjan",
  "timestamp": "2025-12-02T13:47:19Z",
  "aqi": 85,                          // Air Quality Index
  "aqi_level": "MODERATE",            // GOOD, MODERATE, UNHEALTHY, HAZARDOUS
  "pm25": 42.68,                      // Particules fines PM2.5
  "pm10": 76.50,                      // Particules PM10
  "pollen_level": "HIGH",             // ⭐⭐⭐⭐ NOUVEAU: Niveau pollen
  "smoke_detected": false,            // ⭐⭐⭐⭐ NOUVEAU: Fumée détectée
  "created_at": "2025-12-02T13:47:19Z"
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

## 🎨 8. CODES COULEURS POUR L'INTERFACE (MIS À JOUR)

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

### Alert Severity (Sévérité des alertes)

```dart
const Map<String, Color> alertColors = {
  'INFO': Color(0xFF2196F3),         // Bleu
  'WARNING': Color(0xFFFF9800),      // Orange
  'CRITICAL': Color(0xFFF44336),     // Rouge
};
```

### Pollen Level (Niveau de pollen)

```dart
const Map<String, Color> pollenColors = {
  'LOW': Color(0xFF4CAF50),          // Vert
  'MEDIUM': Color(0xFFFFC107),       // Jaune
  'HIGH': Color(0xFFFF9800),         // Orange
};
```

### Activity Level (Niveau d'activité)

```dart
const Map<String, Color> activityColors = {
  'REST': Color(0xFF9C27B0),         // Violet
  'WALK': Color(0xFF2196F3),         // Bleu
  'RUN': Color(0xFFFF5722),          // Rouge-orange
};
```

---

## 📋 9. EXEMPLE COMPLET FLUTTER (MIS À JOUR)

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
