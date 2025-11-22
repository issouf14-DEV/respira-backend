# 📱 Guide d'intégration Flutter - RespirIA Backend

Ce guide vous aide à intégrer le backend RespirIA dans votre application Flutter.

## 🚀 Configuration de base

### 1. Dépendances Flutter (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & Networking
  http: ^1.1.0
  dio: ^5.4.0  # Recommandé pour une gestion avancée
  
  # State Management
  provider: ^6.1.1  # ou riverpod, bloc selon votre préférence
  
  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0  # Pour stocker les tokens JWT
  
  # JSON
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
```

### 2. Configuration API

#### lib/config/api_config.dart
```dart
class ApiConfig {
  // URL de base (à changer selon l'environnement)
  static const String baseUrl = 'http://10.0.2.2:8000';  // Android Emulator
  // static const String baseUrl = 'http://localhost:8000';  // iOS Simulator
  // static const String baseUrl = 'https://api.respira.com';  // Production
  
  static const String apiVersion = '/api/v1';
  static const String apiBaseUrl = '$baseUrl$apiVersion';
  
  // Endpoints
  static const String authRegister = '/users/auth/register/';
  static const String authLogin = '/users/auth/login/';
  static const String authRefresh = '/users/auth/refresh/';
  static const String userMe = '/users/me/';
  static const String userProfile = '/users/me/profile/';
  
  static const String sensorsData = '/sensors/data/';
  static const String sensorsLatest = '/sensors/data/latest/';
  static const String sensorsRiskScore = '/sensors/data/risk_score/';
  static const String sensorsStats = '/sensors/data/stats/';
  
  static const String airQuality = '/environment/air-quality/current/';
  static const String weather = '/environment/weather/current/';
  
  // Headers
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> authHeaders(String token) => {
    ...headers,
    'Authorization': 'Bearer $token',
  };
}
```

## 🔐 Gestion de l'authentification

### 1. Service d'authentification

#### lib/services/auth_service.dart
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  final _storage = const FlutterSecureStorage();
  
  // Clés de stockage
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user';
  
  // Inscription
  Future<Map<String, dynamic>> register({
    required String email,
    required String username,
    required String password,
    required String passwordConfirm,
    required String profileType,
    String? firstName,
    String? lastName,
  }) async {
    final url = Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.authRegister}');
    
    final response = await http.post(
      url,
      headers: ApiConfig.headers,
      body: jsonEncode({
        'email': email,
        'username': username,
        'password': password,
        'password_confirm': passwordConfirm,
        'profile_type': profileType,
        'first_name': firstName ?? '',
        'last_name': lastName ?? '',
      }),
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await _saveTokens(data['tokens']);
      await _saveUser(data['user']);
      return data;
    } else {
      throw Exception('Erreur d\'inscription: ${response.body}');
    }
  }
  
  // Connexion
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final url = Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.authLogin}');
    
    final response = await http.post(
      url,
      headers: ApiConfig.headers,
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveTokens(data);
      return data;
    } else {
      throw Exception('Erreur de connexion: ${response.body}');
    }
  }
  
  // Rafraîchir le token
  Future<String?> refreshToken() async {
    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (refreshToken == null) return null;
    
    final url = Uri.parse('${ApiConfig.apiBaseUrl}${ApiConfig.authRefresh}');
    
    final response = await http.post(
      url,
      headers: ApiConfig.headers,
      body: jsonEncode({'refresh': refreshToken}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _storage.write(key: _accessTokenKey, value: data['access']);
      return data['access'];
    }
    
    return null;
  }
  
  // Déconnexion
  Future<void> logout() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }
  
  // Récupérer le token
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  // Vérifier si connecté
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null;
  }
  
  // Sauvegarder les tokens
  Future<void> _saveTokens(Map<String, dynamic> tokens) async {
    await _storage.write(key: _accessTokenKey, value: tokens['access']);
    await _storage.write(key: _refreshTokenKey, value: tokens['refresh']);
  }
  
  // Sauvegarder l'utilisateur
  Future<void> _saveUser(Map<String, dynamic> user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user));
  }
}
```

### 2. Client HTTP avec intercepteur

#### lib/services/api_client.dart
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class ApiClient {
  final AuthService _authService = AuthService();
  
  // GET Request
  Future<http.Response> get(String endpoint, {Map<String, String>? params}) async {
    final token = await _authService.getAccessToken();
    final uri = Uri.parse('${ApiConfig.apiBaseUrl}$endpoint');
    final uriWithParams = params != null 
        ? uri.replace(queryParameters: params)
        : uri;
    
    var response = await http.get(
      uriWithParams,
      headers: token != null ? ApiConfig.authHeaders(token) : ApiConfig.headers,
    );
    
    // Retry avec refresh token si 401
    if (response.statusCode == 401) {
      final newToken = await _authService.refreshToken();
      if (newToken != null) {
        response = await http.get(
          uriWithParams,
          headers: ApiConfig.authHeaders(newToken),
        );
      }
    }
    
    return response;
  }
  
  // POST Request
  Future<http.Response> post(String endpoint, {Map<String, dynamic>? body}) async {
    final token = await _authService.getAccessToken();
    final uri = Uri.parse('${ApiConfig.apiBaseUrl}$endpoint');
    
    var response = await http.post(
      uri,
      headers: token != null ? ApiConfig.authHeaders(token) : ApiConfig.headers,
      body: body != null ? jsonEncode(body) : null,
    );
    
    if (response.statusCode == 401) {
      final newToken = await _authService.refreshToken();
      if (newToken != null) {
        response = await http.post(
          uri,
          headers: ApiConfig.authHeaders(newToken),
          body: body != null ? jsonEncode(body) : null,
        );
      }
    }
    
    return response;
  }
  
  // PUT/PATCH/DELETE similaires...
}
```

## 📊 Modèles de données

### lib/models/user.dart
```dart
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String email;
  final String username;
  @JsonKey(name: 'first_name')
  final String? firstName;
  @JsonKey(name: 'last_name')
  final String? lastName;
  final String? phone;
  final Profile? profile;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  User({
    required this.id,
    required this.email,
    required this.username,
    this.firstName,
    this.lastName,
    this.phone,
    this.profile,
    required this.createdAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class Profile {
  @JsonKey(name: 'profile_type')
  final String profileType;
  final String? city;
  @JsonKey(name: 'alerts_enabled')
  final bool alertsEnabled;
  @JsonKey(name: 'days_without_symptoms')
  final int daysWithoutSymptoms;
  
  Profile({
    required this.profileType,
    this.city,
    required this.alertsEnabled,
    required this.daysWithoutSymptoms,
  });
  
  factory Profile.fromJson(Map<String, dynamic> json) => _$ProfileFromJson(json);
  Map<String, dynamic> toJson() => _$ProfileToJson(this);
}
```

### lib/models/sensor_data.dart
```dart
import 'package:json_annotation/json_annotation.dart';

part 'sensor_data.g.dart';

@JsonSerializable()
class SensorData {
  final int id;
  final DateTime timestamp;
  final int spo2;
  @JsonKey(name: 'heart_rate')
  final int heartRate;
  @JsonKey(name: 'respiratory_rate')
  final int? respiratoryRate;
  final double? temperature;
  @JsonKey(name: 'activity_level')
  final String? activityLevel;
  @JsonKey(name: 'risk_score')
  final int? riskScore;
  @JsonKey(name: 'risk_level')
  final String? riskLevel;
  
  SensorData({
    required this.id,
    required this.timestamp,
    required this.spo2,
    required this.heartRate,
    this.respiratoryRate,
    this.temperature,
    this.activityLevel,
    this.riskScore,
    this.riskLevel,
  });
  
  factory SensorData.fromJson(Map<String, dynamic> json) => _$SensorDataFromJson(json);
  Map<String, dynamic> toJson() => _$SensorDataToJson(this);
}
```

## 🎯 Exemples d'utilisation

### 1. Écran de connexion

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _authService = AuthService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  
  Future<void> _login() async {
    setState(() => _isLoading = true);
    
    try {
      await _authService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );
      
      // Navigation vers la page d'accueil
      Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Connexion')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Mot de passe'),
              obscureText: true,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _login,
              child: _isLoading 
                  ? CircularProgressIndicator()
                  : Text('Se connecter'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 2. Service pour les données de capteurs

```dart
import '../services/api_client.dart';
import '../models/sensor_data.dart';
import 'dart:convert';

class SensorService {
  final ApiClient _apiClient = ApiClient();
  
  Future<SensorData> getLatestData() async {
    final response = await _apiClient.get('/sensors/data/latest/');
    
    if (response.statusCode == 200) {
      return SensorData.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur de récupération des données');
    }
  }
  
  Future<void> sendData(SensorData data) async {
    final response = await _apiClient.post(
      '/sensors/data/',
      body: data.toJson(),
    );
    
    if (response.statusCode != 201) {
      throw Exception('Erreur d\'envoi des données');
    }
  }
  
  Future<Map<String, dynamic>> getRiskScore() async {
    final response = await _apiClient.get('/sensors/data/risk_score/');
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erreur de récupération du score de risque');
    }
  }
}
```

## 🔧 Configuration Android

### android/app/src/main/AndroidManifest.xml
```xml
<manifest ...>
    <!-- Permissions Internet -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    
    <application
        ...
        android:usesCleartextTraffic="true">  <!-- Pour développement local -->
        ...
    </application>
</manifest>
```

## 🍎 Configuration iOS

### ios/Runner/Info.plist
```xml
<dict>
    ...
    <!-- Pour développement local -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
```

## 🧪 Tests

### Test de connexion
```dart
void main() {
  test('Login test', () async {
    final authService = AuthService();
    
    try {
      final result = await authService.login(
        email: 'test@respira.com',
        password: 'TestPass123!',
      );
      
      expect(result['access'], isNotNull);
      expect(result['refresh'], isNotNull);
    } catch (e) {
      fail('Login failed: $e');
    }
  });
}
```

## 📱 Générateur de modèles

Après avoir créé vos modèles avec `@JsonSerializable()`, exécutez :

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## 🚀 Commandes utiles

```bash
# Générer les modèles JSON
flutter pub run build_runner build

# Lancer l'app
flutter run

# Tests
flutter test

# Build APK
flutter build apk

# Build iOS
flutter build ios
```

## 📝 Notes importantes

1. **URLs**: Utilisez `10.0.2.2` pour l'émulateur Android au lieu de `localhost`
2. **CORS**: Le backend est configuré pour accepter toutes les origines en développement
3. **Tokens**: Utilisez `flutter_secure_storage` pour stocker les tokens JWT de manière sécurisée
4. **Refresh Token**: Implémentez la logique de rafraîchissement automatique des tokens
5. **Erreurs**: Gérez les erreurs HTTP avec des try-catch et des messages utilisateur appropriés

## 🔗 Endpoints principaux

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/users/auth/register/` | POST | Inscription |
| `/api/v1/users/auth/login/` | POST | Connexion |
| `/api/v1/users/me/` | GET/PUT | Profil utilisateur |
| `/api/v1/sensors/data/` | GET/POST | Données capteurs |
| `/api/v1/sensors/data/latest/` | GET | Dernières données |
| `/api/v1/sensors/data/risk_score/` | GET | Score de risque |
| `/api/v1/environment/air-quality/current/` | GET | Qualité air |
| `/api/v1/environment/weather/current/` | GET | Météo |

---

**Le backend est prêt pour Flutter ! 🚀**
