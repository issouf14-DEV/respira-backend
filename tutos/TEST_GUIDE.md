# 🧪 Guide de test de l'API RespirIA

## Configuration PowerShell

```powershell
# URL de base
$baseUrl = "http://localhost:8000/api/v1"
```

## 1️⃣ Authentification

### Inscription d'un nouvel utilisateur

```powershell
$registerBody = @{
    email = "nouveau@respira.com"
    username = "nouveauuser"
    password = "SecurePass123!"
    password_confirm = "SecurePass123!"
    profile_type = "ASTHMATIC"  # ou "PREVENTION" ou "REMISSION"
    first_name = "Nouveau"
    last_name = "Utilisateur"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "$baseUrl/users/auth/register/" `
    -Method POST `
    -Body $registerBody `
    -ContentType 'application/json'

$result = $response.Content | ConvertFrom-Json
Write-Host "Token: $($result.tokens.access)"
```

### Connexion

```powershell
$loginBody = @{
    email = "test@respira.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "$baseUrl/users/auth/login/" `
    -Method POST `
    -Body $loginBody `
    -ContentType 'application/json'

$tokens = $response.Content | ConvertFrom-Json

# Créer les headers avec le token
$headers = @{
    Authorization = "Bearer $($tokens.access)"
}

Write-Host "✓ Connecté avec succès!" -ForegroundColor Green
Write-Host "Access Token: $($tokens.access.Substring(0,50))..." -ForegroundColor Gray
```

### Rafraîchir le token

```powershell
$refreshBody = @{
    refresh = $tokens.refresh
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "$baseUrl/users/auth/refresh/" `
    -Method POST `
    -Body $refreshBody `
    -ContentType 'application/json'

$newTokens = $response.Content | ConvertFrom-Json
```

## 2️⃣ Profil Utilisateur

### Récupérer son profil

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/users/me/" `
    -Method GET `
    -Headers $headers

$user = $response.Content | ConvertFrom-Json
$user | ConvertTo-Json -Depth 5 | Write-Host
```

### Mettre à jour son profil

```powershell
$updateBody = @{
    first_name = "Prénom"
    last_name = "Nom"
    phone = "+225 0101010101"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "$baseUrl/users/me/" `
    -Method PATCH `
    -Headers $headers `
    -Body $updateBody `
    -ContentType 'application/json'
```

### Mettre à jour le profil de santé

```powershell
$profileBody = @{
    profile_type = "REMISSION"
    city = "Abidjan"
    alerts_enabled = $true
    days_without_symptoms = 15
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "$baseUrl/users/me/profile/" `
    -Method PATCH `
    -Headers $headers `
    -Body $profileBody `
    -ContentType 'application/json'
```

## 3️⃣ Données des Capteurs

### Envoyer des données de santé

```powershell
$sensorData = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    spo2 = 98
    heart_rate = 72
    respiratory_rate = 16
    temperature = 36.7
    activity_level = "REST"  # ou "LIGHT", "MODERATE", "INTENSE"
    steps = 1500
    risk_score = 20
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/data/" `
    -Method POST `
    -Headers $headers `
    -Body $sensorData `
    -ContentType 'application/json'

Write-Host "✓ Données envoyées!" -ForegroundColor Green
```

### Récupérer les dernières données

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/data/latest/" `
    -Method GET `
    -Headers $headers

$latest = $response.Content | ConvertFrom-Json
Write-Host "SpO2: $($latest.spo2)%, FC: $($latest.heart_rate) bpm" -ForegroundColor Cyan
```

### Score de risque actuel

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/data/risk_score/" `
    -Method GET `
    -Headers $headers

$risk = $response.Content | ConvertFrom-Json
Write-Host "Risque: $($risk.risk_level) (Score: $($risk.risk_score))" -ForegroundColor Yellow
```

### Statistiques sur 24h

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/data/stats/?period=24h" `
    -Method GET `
    -Headers $headers

$stats = $response.Content | ConvertFrom-Json
$stats.stats | Format-Table
```

### Liste de toutes les données

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/data/?page=1" `
    -Method GET `
    -Headers $headers

$data = $response.Content | ConvertFrom-Json
Write-Host "Total: $($data.count) enregistrements"
$data.results | Select-Object timestamp, spo2, heart_rate, risk_level | Format-Table
```

## 4️⃣ Appareils (Bracelets)

### Liste des appareils

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/devices/" `
    -Method GET `
    -Headers $headers

$devices = $response.Content | ConvertFrom-Json
$devices.results | Format-Table
```

### Ajouter un appareil

```powershell
$deviceBody = @{
    device_id = "BRACELET_001"
    device_name = "Mon Bracelet Principal"
    battery_level = 85
    is_connected = $true
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "$baseUrl/sensors/devices/" `
    -Method POST `
    -Headers $headers `
    -Body $deviceBody `
    -ContentType 'application/json'

Write-Host "✓ Appareil ajouté!" -ForegroundColor Green
```

### Mettre à jour un appareil

```powershell
$updateDevice = @{
    battery_level = 60
    is_connected = $true
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "$baseUrl/sensors/devices/1/" `
    -Method PATCH `
    -Headers $headers `
    -Body $updateDevice `
    -ContentType 'application/json'
```

## 5️⃣ Environnement

### Qualité de l'air actuelle

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/environment/air-quality/current/?city=Abidjan" `
    -Method GET `
    -Headers $headers

$airQuality = $response.Content | ConvertFrom-Json
Write-Host "AQI: $($airQuality.aqi) - Niveau: $($airQuality.aqi_level)" -ForegroundColor Cyan
Write-Host "PM2.5: $($airQuality.pm25) µg/m³" -ForegroundColor Gray
```

### Météo actuelle

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/environment/weather/current/?city=Abidjan" `
    -Method GET `
    -Headers $headers

$weather = $response.Content | ConvertFrom-Json
Write-Host "Température: $($weather.temperature)°C" -ForegroundColor Yellow
Write-Host "Humidité: $($weather.humidity)%" -ForegroundColor Cyan
Write-Host "Description: $($weather.description)" -ForegroundColor Gray
```

### Historique qualité de l'air

```powershell
$response = Invoke-WebRequest `
    -Uri "$baseUrl/environment/air-quality/?city=Abidjan" `
    -Method GET `
    -Headers $headers

$history = $response.Content | ConvertFrom-Json
$history.results | Select-Object timestamp, aqi, aqi_level | Format-Table
```

## 6️⃣ Scénarios complets

### Scénario 1: Nouveau patient s'inscrit et envoie ses premières données

```powershell
# 1. Inscription
$registerBody = @{
    email = "patient@example.com"
    username = "patient1"
    password = "Patient123!"
    password_confirm = "Patient123!"
    profile_type = "ASTHMATIC"
    first_name = "Jean"
    last_name = "Dupont"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$baseUrl/users/auth/register/" -Method POST -Body $registerBody -ContentType 'application/json'
$tokens = ($response.Content | ConvertFrom-Json).tokens
$headers = @{Authorization = "Bearer $($tokens.access)"}

Write-Host "✓ Patient inscrit" -ForegroundColor Green

# 2. Configurer le profil
$profileBody = @{
    city = "Abidjan"
    alerts_enabled = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "$baseUrl/users/me/profile/" -Method PATCH -Headers $headers -Body $profileBody -ContentType 'application/json'

Write-Host "✓ Profil configuré" -ForegroundColor Green

# 3. Envoyer les premières données
$sensorData = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    spo2 = 96
    heart_rate = 78
    respiratory_rate = 18
    temperature = 36.9
    activity_level = "MODERATE"
    risk_score = 35
} | ConvertTo-Json

Invoke-WebRequest -Uri "$baseUrl/sensors/data/" -Method POST -Headers $headers -Body $sensorData -ContentType 'application/json'

Write-Host "✓ Données envoyées" -ForegroundColor Green

# 4. Vérifier le risque
$response = Invoke-WebRequest -Uri "$baseUrl/sensors/data/risk_score/" -Method GET -Headers $headers
$risk = $response.Content | ConvertFrom-Json
Write-Host "Niveau de risque: $($risk.risk_level)" -ForegroundColor Yellow
```

### Scénario 2: Surveillance quotidienne

```powershell
# Connexion
$loginBody = @{email="test@respira.com"; password="TestPass123!"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$baseUrl/users/auth/login/" -Method POST -Body $loginBody -ContentType 'application/json'
$headers = @{Authorization = "Bearer $(($response.Content | ConvertFrom-Json).access)"}

Write-Host "`n=== Dashboard Quotidien ===" -ForegroundColor Cyan

# Dernières données vitales
$response = Invoke-WebRequest -Uri "$baseUrl/sensors/data/latest/" -Headers $headers
$latest = $response.Content | ConvertFrom-Json
Write-Host "`nDonnées vitales:"
Write-Host "  SpO2: $($latest.spo2)%" -ForegroundColor Green
Write-Host "  Fréquence cardiaque: $($latest.heart_rate) bpm" -ForegroundColor Green
Write-Host "  Température: $($latest.temperature)°C" -ForegroundColor Green

# Risque actuel
$response = Invoke-WebRequest -Uri "$baseUrl/sensors/data/risk_score/" -Headers $headers
$risk = $response.Content | ConvertFrom-Json
Write-Host "`nRisque: $($risk.risk_level)" -ForegroundColor Yellow

# Environnement
$response = Invoke-WebRequest -Uri "$baseUrl/environment/air-quality/current/" -Headers $headers
$air = $response.Content | ConvertFrom-Json
Write-Host "`nQualité de l'air: $($air.aqi_level) (AQI: $($air.aqi))" -ForegroundColor Cyan

$response = Invoke-WebRequest -Uri "$baseUrl/environment/weather/current/" -Headers $headers
$weather = $response.Content | ConvertFrom-Json
Write-Host "Météo: $($weather.temperature)°C, $($weather.description)" -ForegroundColor Cyan

# Statistiques
$response = Invoke-WebRequest -Uri "$baseUrl/sensors/data/stats/?period=24h" -Headers $headers
$stats = $response.Content | ConvertFrom-Json
Write-Host "`nStatistiques 24h:"
Write-Host "  SpO2 moyen: $([math]::Round($stats.stats.avg_spo2, 1))%" -ForegroundColor Gray
Write-Host "  FC moyenne: $([math]::Round($stats.stats.avg_heart_rate, 0)) bpm" -ForegroundColor Gray
```

## 7️⃣ Tests de performance

### Envoi multiple de données (simulation)

```powershell
Write-Host "Envoi de 10 enregistrements..." -ForegroundColor Yellow

1..10 | ForEach-Object {
    $data = @{
        timestamp = (Get-Date).AddMinutes(-$_ * 5).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        spo2 = Get-Random -Minimum 94 -Maximum 99
        heart_rate = Get-Random -Minimum 60 -Maximum 90
        respiratory_rate = Get-Random -Minimum 14 -Maximum 20
        temperature = [math]::Round((Get-Random -Minimum 36.5 -Maximum 37.2), 1)
        activity_level = @("REST", "LIGHT", "MODERATE")[(Get-Random -Minimum 0 -Maximum 3)]
        risk_score = Get-Random -Minimum 10 -Maximum 50
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri "$baseUrl/sensors/data/" -Method POST -Headers $headers -Body $data -ContentType 'application/json' | Out-Null
    Write-Host "  ✓ Enregistrement $_" -ForegroundColor Green
}

Write-Host "`n✓ Tous les enregistrements envoyés!" -ForegroundColor Green
```

## 🔍 Débogage

### Vérifier le statut de l'API

```powershell
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -ErrorAction Stop
    Write-Host "✓ API accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ API non accessible" -ForegroundColor Red
    Write-Host "Vérifiez que Docker est lancé: docker compose ps"
}
```

### Voir les logs en temps réel

```powershell
docker compose logs -f web
```

### Redémarrer l'API

```powershell
docker compose restart web
Write-Host "API redémarrée, attendez 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
```

## 📊 Résultats attendus

| Endpoint | Code | Temps |
|----------|------|-------|
| POST /auth/register/ | 201 | < 1s |
| POST /auth/login/ | 200 | < 500ms |
| GET /users/me/ | 200 | < 200ms |
| POST /sensors/data/ | 201 | < 300ms |
| GET /sensors/data/latest/ | 200 | < 200ms |
| GET /environment/air-quality/current/ | 200 | < 1s |
| GET /environment/weather/current/ | 200 | < 1s |

---

**Astuce**: Sauvegardez vos tokens dans des variables pour les réutiliser :
```powershell
# Sauvegarder
$env:RESPIRA_TOKEN = $tokens.access

# Réutiliser
$headers = @{Authorization = "Bearer $env:RESPIRA_TOKEN"}
```
