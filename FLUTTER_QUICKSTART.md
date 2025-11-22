# 🚀 Quick Start Flutter - RespirIA

**Temps estimé : 15 minutes**

## 1️⃣ Vérifier que le backend fonctionne

```powershell
# Ouvrir dans le navigateur
Start-Process "http://localhost:8000/"

# Ou tester en PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/"
```

**Résultat attendu** : JSON avec la liste des endpoints

## 2️⃣ Créer votre projet Flutter

```bash
flutter create respira_app
cd respira_app
```

## 3️⃣ Ajouter les dépendances

Modifier `pubspec.yaml` :

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP client
  dio: ^5.4.0
  
  # Stockage sécurisé des tokens
  flutter_secure_storage: ^9.0.0
  
  # JSON serialization
  json_annotation: ^4.8.1
  
  # State management (optionnel)
  provider: ^6.1.1

dev_dependencies:
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
```

Puis :
```bash
flutter pub get
```

## 4️⃣ Configuration de base

Créer `lib/config/api_config.dart` :

```dart
class ApiConfig {
  // Android Emulator
  static const String baseUrl = 'http://10.0.2.2:8000';
  
  // Pour iOS Simulator, utiliser :
  // static const String baseUrl = 'http://localhost:8000';
  
  static const String apiVersion = '/api/v1';
  static const String apiBaseUrl = '$baseUrl$apiVersion';
}
```

## 5️⃣ Premier test de connexion

Créer `lib/main.dart` :

```dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RespirIA',
      home: TestScreen(),
    );
  }
}

class TestScreen extends StatefulWidget {
  @override
  _TestScreenState createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  String result = 'Appuyez sur le bouton pour tester';
  bool loading = false;

  Future<void> testConnection() async {
    setState(() {
      loading = true;
      result = 'Connexion en cours...';
    });

    try {
      final dio = Dio();
      
      // Test 1: Page racine
      final rootResponse = await dio.get('http://10.0.2.2:8000/');
      print('✅ Backend accessible: ${rootResponse.data['message']}');
      
      // Test 2: Login
      final loginResponse = await dio.post(
        'http://10.0.2.2:8000/api/v1/users/auth/login/',
        data: {
          'email': 'test@respira.com',
          'password': 'TestPass123!',
        },
      );
      
      final accessToken = loginResponse.data['access'];
      print('✅ Login réussi');
      
      // Test 3: Profil
      final profileResponse = await dio.get(
        'http://10.0.2.2:8000/api/v1/users/me/',
        options: Options(
          headers: {'Authorization': 'Bearer $accessToken'},
        ),
      );
      
      setState(() {
        loading = false;
        result = '''
✅ Backend connecté !

Utilisateur: ${profileResponse.data['username']}
Email: ${profileResponse.data['email']}
Type: ${profileResponse.data['profile']['profile_type']}
        ''';
      });
      
    } catch (e) {
      setState(() {
        loading = false;
        result = '❌ Erreur: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Test Backend RespirIA'),
      ),
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                CircularProgressIndicator()
              else
                Text(
                  result,
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16),
                ),
              SizedBox(height: 40),
              ElevatedButton(
                onPressed: loading ? null : testConnection,
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  child: Text('Tester la connexion'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## 6️⃣ Configuration Android

Modifier `android/app/src/main/AndroidManifest.xml` :

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Ajouter ces permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    
    <application
        ...
        android:usesCleartextTraffic="true">  <!-- Pour développement local -->
        ...
    </application>
</manifest>
```

## 7️⃣ Lancer l'app

```bash
# Android
flutter run

# Ou spécifier l'appareil
flutter run -d <device_id>
```

## 8️⃣ Tester

1. Lancez l'app sur l'émulateur Android
2. Appuyez sur "Tester la connexion"
3. Vous devriez voir : ✅ Backend connecté !

## ✅ Checklist de validation

- [ ] Backend Docker démarré (`docker compose up -d`)
- [ ] Page http://localhost:8000/ accessible dans le navigateur
- [ ] Projet Flutter créé
- [ ] Dépendances installées (`flutter pub get`)
- [ ] AndroidManifest.xml modifié
- [ ] URL correcte dans le code (`10.0.2.2` pour Android)
- [ ] App lancée sur l'émulateur
- [ ] Test de connexion réussi

## 🎯 Prochaines étapes

Maintenant que la connexion fonctionne :

1. **Lire la documentation complète** :
   - `FLUTTER_INTEGRATION.md` pour l'implémentation détaillée
   - `API_DOCUMENTATION.md` pour les endpoints

2. **Implémenter les services** :
   - `AuthService` pour la gestion complète de l'auth
   - `ApiClient` avec intercepteur JWT
   - `SensorService` pour les données biométriques

3. **Créer les modèles** :
   ```dart
   @JsonSerializable()
   class User {
     final int id;
     final String email;
     final String username;
     // ...
   }
   ```

4. **Développer les écrans** :
   - Login / Register
   - Dashboard avec données en temps réel
   - Profil utilisateur
   - Statistiques

## 🆘 Problèmes courants

### Erreur "Connection refused"

**Android** : Vérifiez que vous utilisez `10.0.2.2` au lieu de `localhost`

**iOS** : Utilisez `localhost:8000`

### Erreur "Cleartext HTTP traffic"

Ajoutez `android:usesCleartextTraffic="true"` dans AndroidManifest.xml

### Backend ne répond pas

Vérifiez :
```powershell
docker compose ps  # Les conteneurs doivent être "Up"
docker compose logs -f web  # Voir les logs
```

## 📚 Documentation

- `STATUS_FLUTTER.md` - Statut et guide de démarrage
- `FLUTTER_INTEGRATION.md` - Guide technique complet
- `API_DOCUMENTATION.md` - Documentation API
- Swagger : http://localhost:8000/swagger/

## 💡 Conseils

1. **Utilisez Dio** au lieu de http pour une meilleure gestion des erreurs
2. **Stockez les JWT** avec flutter_secure_storage
3. **Implémentez un intercepteur** pour le refresh automatique des tokens
4. **Gérez les erreurs** avec des try-catch et des messages utilisateur
5. **Testez d'abord** avec Postman/Swagger avant d'implémenter dans Flutter

---

**Bravo ! Vous êtes prêt à développer votre app Flutter ! 🎉**

En cas de problème, consultez `TROUBLESHOOTING.md` ou les logs Docker.
