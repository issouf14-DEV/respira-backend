# 🔑 Guide d'obtention des clés API - RespirIA

## 📋 Clés API nécessaires

1. **IQAir API** - Qualité de l'air (AQI)
2. **OpenWeatherMap API** - Données météo

---

## 🌍 1. IQAir API - Qualité de l'air

### Pourquoi IQAir ?

IQAir fournit des données de qualité de l'air en temps réel pour le monde entier, incluant :
- ✅ AQI (Air Quality Index)
- ✅ Pollution PM2.5, PM10
- ✅ Données pour Abidjan et autres villes

### Obtenir la clé API (Gratuit)

#### Étape 1 : Créer un compte

1. Allez sur : **https://www.iqair.com/fr/air-pollution-data-api**
2. Cliquez sur **"Get API Key"** ou **"Sign Up"**
3. Remplissez le formulaire :
   - Nom complet
   - Email
   - Organisation : `RespirIA` ou `Personnel`
   - Pays : `Côte d'Ivoire`
   - Utilisation : `Health monitoring application`

#### Étape 2 : Confirmer l'email

1. Vérifiez votre boîte mail
2. Cliquez sur le lien de confirmation
3. Connectez-vous à votre compte

#### Étape 3 : Récupérer la clé API

1. Dashboard → **API Keys**
2. Copiez votre clé (format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
3. Notez-la en sécurité

### Plan gratuit

```
✅ 10,000 appels/mois
✅ Données en temps réel
✅ Villes du monde entier
✅ Aucune carte bancaire requise
```

**Suffisant pour** : ~330 appels/jour = Parfait pour votre app

### Alternative si IQAir non disponible

Si vous ne pouvez pas créer de compte IQAir, utilisez **AirVisual** (même API) :
- https://api-docs.iqair.com/
- Même procédure d'inscription

---

## ☁️ 2. OpenWeatherMap API - Météo

### Pourquoi OpenWeatherMap ?

OpenWeatherMap fournit des données météo complètes :
- ✅ Température, humidité
- ✅ Description météo
- ✅ Données pour Abidjan et autres villes

### Obtenir la clé API (Gratuit)

#### Étape 1 : Créer un compte

1. Allez sur : **https://openweathermap.org/api**
2. Cliquez sur **"Sign Up"** (en haut à droite)
3. Remplissez le formulaire :
   - Username : `votreusername`
   - Email
   - Password
   - Cochez la case **"I agree to the Privacy Policy"**
4. Cliquez sur **"Create Account"**

#### Étape 2 : Confirmer l'email

1. Vérifiez votre boîte mail
2. Cliquez sur le lien de confirmation dans l'email de OpenWeatherMap
3. Connectez-vous avec vos identifiants

#### Étape 3 : Récupérer la clé API

1. Une fois connecté, allez sur : **https://home.openweathermap.org/api_keys**
2. Vous verrez une clé API déjà créée (format : `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. Ou créez une nouvelle clé en entrant un nom dans **"API key name"** → **"Generate"**
4. Copiez votre clé
5. Notez-la en sécurité

⚠️ **IMPORTANT** : La clé peut prendre **quelques heures** (max 2h) pour être activée après création !

### Plan gratuit

```
✅ 60 appels/minute
✅ 1,000,000 appels/mois
✅ Données en temps réel
✅ Aucune carte bancaire requise
```

**Suffisant pour** : Largement plus que nécessaire pour votre app

---

## 🔧 Configuration des clés dans votre backend

### Méthode 1 : Fichier .env (Recommandé)

#### Étape 1 : Ouvrir le fichier .env

```powershell
code .env
```

#### Étape 2 : Remplacer les clés

```env
# Avant
IQAIR_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here

# Après (remplacez par vos vraies clés)
IQAIR_API_KEY=your_iqair_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

#### Étape 3 : Redémarrer Docker

```powershell
docker compose down
docker compose up -d
```

#### Étape 4 : Vérifier que ça fonctionne

```powershell
# Se connecter
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/users/auth/login/" -Method Post -Body (@{email="test@respira.com"; password="TestPass123!"} | ConvertTo-Json) -ContentType "application/json"

$headers = @{Authorization = "Bearer $($login.access)"}

# Tester Air Quality
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/environment/air-quality/current/?city=Abidjan" -Headers $headers

# Tester Weather
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/environment/weather/current/?city=Abidjan" -Headers $headers
```

**Résultat attendu** : Données réelles au lieu de données simulées

---

### Méthode 2 : Variables d'environnement Docker

#### Modifier docker-compose.yml

```yaml
services:
  web:
    environment:
      - IQAIR_API_KEY=your_iqair_api_key_here
      - OPENWEATHER_API_KEY=your_openweather_api_key_here
```

---

## 🧪 Tester vos clés API

### Test IQAir API (Manuel)

```powershell
$iqairKey = "VOTRE_CLE_IQAIR"
$url = "http://api.airvisual.com/v2/city?city=Abidjan&country=Cote d'Ivoire&key=$iqairKey"
Invoke-RestMethod -Uri $url
```

**Résultat attendu** :
```json
{
  "status": "success",
  "data": {
    "current": {
      "pollution": {
        "aqius": 79
      }
    }
  }
}
```

### Test OpenWeatherMap API (Manuel)

```powershell
$weatherKey = "VOTRE_CLE_OPENWEATHER"
$url = "http://api.openweathermap.org/data/2.5/weather?q=Abidjan&appid=$weatherKey&units=metric&lang=fr"
Invoke-RestMethod -Uri $url
```

**Résultat attendu** :
```json
{
  "main": {
    "temp": 28.5,
    "humidity": 75
  },
  "weather": [
    {
      "description": "nuageux"
    }
  ]
}
```

---

## ⚠️ Données simulées vs Données réelles

### Actuellement (Sans clés API)

Votre backend retourne des **données simulées** :

```json
// Air Quality
{
  "city": "Abidjan",
  "aqi": 75,
  "aqi_level": "MODERATE",
  "timestamp": "2025-11-20T10:00:00Z"
}

// Weather
{
  "city": "Abidjan",
  "temperature": 28.0,
  "humidity": 70,
  "description": "Ensoleillé"
}
```

### Avec clés API réelles

Données **réelles et actualisées** depuis les APIs externes.

---

## 🚀 Utilisation avec Flutter

### Configuration Flutter

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://localhost:8000/api/v1';
  
  // Pour Android Emulator
  // static const String baseUrl = 'http://10.0.2.2:8000/api/v1';
  
  // Pour iOS Simulator
  // static const String baseUrl = 'http://127.0.0.1:8000/api/v1';
  
  // Pour device réel
  // static const String baseUrl = 'http://VOTRE_IP_LOCAL:8000/api/v1';
}
```

### Service Air Quality Flutter

```dart
// lib/services/environment_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class EnvironmentService {
  final String baseUrl = 'http://localhost:8000/api/v1';
  
  Future<Map<String, dynamic>> getAirQuality(String city, String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/environment/air-quality/current/?city=$city'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load air quality');
    }
  }
  
  Future<Map<String, dynamic>> getWeather(String city, String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/environment/weather/current/?city=$city'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load weather');
    }
  }
}
```

### Utilisation dans un Widget Flutter

```dart
// lib/screens/environment_screen.dart
import 'package:flutter/material.dart';

class EnvironmentScreen extends StatefulWidget {
  @override
  _EnvironmentScreenState createState() => _EnvironmentScreenState();
}

class _EnvironmentScreenState extends State<EnvironmentScreen> {
  Map<String, dynamic>? airQuality;
  Map<String, dynamic>? weather;
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    loadData();
  }
  
  Future<void> loadData() async {
    final service = EnvironmentService();
    final token = await getToken(); // Votre méthode pour récupérer le token
    
    try {
      final aq = await service.getAirQuality('Abidjan', token);
      final w = await service.getWeather('Abidjan', token);
      
      setState(() {
        airQuality = aq;
        weather = w;
        isLoading = false;
      });
    } catch (e) {
      print('Error: $e');
      setState(() {
        isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    return Column(
      children: [
        // Air Quality Card
        Card(
          child: ListTile(
            title: Text('Qualité de l\'air'),
            subtitle: Text('AQI: ${airQuality?['aqi']}'),
            trailing: _getAqiColor(airQuality?['aqi_level']),
          ),
        ),
        
        // Weather Card
        Card(
          child: ListTile(
            title: Text('Météo'),
            subtitle: Text('${weather?['temperature']}°C - ${weather?['description']}'),
            trailing: Icon(Icons.wb_sunny),
          ),
        ),
      ],
    );
  }
  
  Widget _getAqiColor(String? level) {
    Color color;
    switch (level) {
      case 'GOOD':
        color = Colors.green;
        break;
      case 'MODERATE':
        color = Colors.yellow;
        break;
      case 'UNHEALTHY':
        color = Colors.orange;
        break;
      case 'HAZARDOUS':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}
```

---

## 📝 Résumé des étapes

### 1. Obtenir les clés API (30 minutes)

- [ ] Créer compte IQAir → Copier clé
- [ ] Créer compte OpenWeatherMap → Copier clé
- [ ] Attendre activation OpenWeatherMap (max 2h)

### 2. Configurer le backend (5 minutes)

- [ ] Éditer `.env`
- [ ] Coller les clés API
- [ ] Redémarrer Docker

### 3. Tester (5 minutes)

- [ ] Tester endpoint air-quality
- [ ] Tester endpoint weather
- [ ] Vérifier données réelles

### 4. Intégrer dans Flutter (30 minutes)

- [ ] Créer service environment_service.dart
- [ ] Créer écran environment_screen.dart
- [ ] Tester l'affichage

---

## 🎯 Prochaines étapes

1. **Obtenir les clés API** (commencez maintenant)
2. **Configurer le .env**
3. **Développer l'interface Flutter**
4. **Tester avec données réelles**

---

## 🆘 Problèmes courants

### IQAir : "Invalid API Key"

- Vérifiez que vous avez confirmé votre email
- Attendez quelques minutes après création du compte
- Vérifiez que la clé est bien copiée sans espaces

### OpenWeatherMap : "Invalid API Key"

- **Attendez 2h** après création de la clé
- Vérifiez que la clé est activée dans le dashboard
- Testez avec l'endpoint simple : `http://api.openweathermap.org/data/2.5/weather?q=London&appid=VOTRE_CLE`

### Docker ne voit pas les nouvelles clés

```powershell
# Forcer la reconstruction
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Les données ne changent pas

Les données sont **cachées** :
- Air Quality : 1 heure
- Weather : 30 minutes

Attendez ou videz le cache :
```powershell
docker compose exec web python manage.py shell
```
```python
from apps.environment.models import AirQuality, Weather
AirQuality.objects.all().delete()
Weather.objects.all().delete()
```

---

**Vous êtes maintenant prêt à obtenir vos clés API et commencer le développement Flutter ! 🚀**

**Liens directs** :
- IQAir : https://www.iqair.com/fr/air-pollution-data-api
- OpenWeatherMap : https://openweathermap.org/api
