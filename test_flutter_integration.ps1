# Script de test pour l'integration Flutter - RespirIA Backend
# Ce script simule les appels que ferait une application Flutter

Write-Host "Tests d'integration Flutter - RespirIA Backend" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

$BaseUrl = "http://localhost:8000"
$ApiUrl = "$BaseUrl/api/v1"
$TestEmail = "test@respira.com"
$TestPassword = "TestPass123!"

# Fonction pour afficher les resultats
function Show-Result {
    param($Title, $Response, $StatusCode)
    Write-Host "[OK] $Title" -ForegroundColor Green
    Write-Host "  Status: $StatusCode" -ForegroundColor Yellow
    if ($Response) {
        Write-Host "  Reponse: $($Response | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Gray
    }
    Write-Host ""
}

# 1. Test de la page racine (equivalent app launch)
Write-Host "[1] Test de decouverte de l'API (App Launch)" -ForegroundColor Magenta
try {
    $ApiInfo = Invoke-RestMethod -Uri "$BaseUrl/" -Method Get
    Show-Result "Page racine accessible" $ApiInfo 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 2. Inscription d'un nouvel utilisateur (Sign Up Flutter)
Write-Host "[2] Inscription (Flutter Sign Up Screen)" -ForegroundColor Magenta
$RegisterBody = @{
    email = $TestEmail
    username = "flutter_user"
    password = $TestPassword
    password_confirm = $TestPassword
    profile_type = "patient"
    first_name = "Flutter"
    last_name = "User"
} | ConvertTo-Json

try {
    $RegisterResponse = Invoke-RestMethod -Uri "$ApiUrl/users/auth/register/" `
        -Method Post `
        -Body $RegisterBody `
        -ContentType "application/json"
    
    $AccessToken = $RegisterResponse.tokens.access
    $RefreshToken = $RegisterResponse.tokens.refresh
    
    Show-Result "Inscription reussie" $RegisterResponse 201
    Write-Host "  Access Token: $($AccessToken.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "  Refresh Token: $($RefreshToken.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host ""
} catch {
    # Si l'utilisateur existe deja, on se connecte
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  [INFO] Utilisateur existe deja, connexion..." -ForegroundColor Yellow
        
        $LoginBody = @{
            email = $TestEmail
            password = $TestPassword
        } | ConvertTo-Json
        
        $LoginResponse = Invoke-RestMethod -Uri "$ApiUrl/users/auth/login/" `
            -Method Post `
            -Body $LoginBody `
            -ContentType "application/json"
        
        $AccessToken = $LoginResponse.access
        $RefreshToken = $LoginResponse.refresh
        
        Show-Result "Connexion reussie" $LoginResponse 200
        Write-Host "  Access Token: $($AccessToken.Substring(0, 20))..." -ForegroundColor Cyan
        Write-Host "  Refresh Token: $($RefreshToken.Substring(0, 20))..." -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "[ERREUR] Erreur d'inscription: $_" -ForegroundColor Red
        exit
    }
}

# 3. Recuperation du profil utilisateur (Flutter Profile Screen)
Write-Host "[3] Profil utilisateur (Flutter Profile Screen)" -ForegroundColor Magenta
$Headers = @{
    "Authorization" = "Bearer $AccessToken"
    "Content-Type" = "application/json"
}

try {
    $UserProfile = Invoke-RestMethod -Uri "$ApiUrl/users/me/" `
        -Method Get `
        -Headers $Headers
    
    Show-Result "Profil recupere" $UserProfile 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 4. Envoi de donnees de capteur (Flutter Sensor Reading)
Write-Host "[4] Envoi de donnees capteur (Flutter Real-time Monitoring)" -ForegroundColor Magenta
$SensorData = @{
    spo2 = 97
    heart_rate = 75
    respiratory_rate = 16
    temperature = 36.7
    activity_level = "sedentary"
} | ConvertTo-Json

try {
    $SensorResponse = Invoke-RestMethod -Uri "$ApiUrl/sensors/data/" `
        -Method Post `
        -Headers $Headers `
        -Body $SensorData
    
    Show-Result "Donnees capteur envoyees" $SensorResponse 201
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 5. Recuperation des dernieres donnees (Flutter Dashboard)
Write-Host "[5] Dernieres donnees (Flutter Dashboard Widget)" -ForegroundColor Magenta
try {
    $LatestData = Invoke-RestMethod -Uri "$ApiUrl/sensors/data/latest/" `
        -Method Get `
        -Headers $Headers
    
    Show-Result "Dernieres donnees recuperees" $LatestData 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 6. Score de risque (Flutter Risk Alert)
Write-Host "[6] Score de risque (Flutter Risk Alert Widget)" -ForegroundColor Magenta
try {
    $RiskScore = Invoke-RestMethod -Uri "$ApiUrl/sensors/data/risk_score/" `
        -Method Get `
        -Headers $Headers
    
    Show-Result "Score de risque calcule" $RiskScore 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 7. Qualite de l'air (Flutter Environment Screen)
Write-Host "[7] Qualite de l'air (Flutter Air Quality Card)" -ForegroundColor Magenta
try {
    $fullUri = "$ApiUrl/environment/air-quality/current/?city=Paris"
    
    $AirQuality = Invoke-RestMethod -Uri $fullUri `
        -Method Get `
        -Headers $Headers
    
    Show-Result "Qualite de l'air recuperee" $AirQuality 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 8. Meteo (Flutter Weather Widget)
Write-Host "[8] Meteo (Flutter Weather Widget)" -ForegroundColor Magenta

try {
    $fullUri = "$ApiUrl/environment/weather/current/?city=Paris"
    
    $Weather = Invoke-RestMethod -Uri $fullUri `
        -Method Get `
        -Headers $Headers
    
    Show-Result "Meteo recuperee" $Weather 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 9. Statistiques des capteurs (Flutter Statistics Screen)
Write-Host "[9] Statistiques (Flutter Statistics Chart)" -ForegroundColor Magenta

try {
    $fullUri = "$ApiUrl/sensors/data/stats/?days=7"
    
    $Stats = Invoke-RestMethod -Uri $fullUri `
        -Method Get `
        -Headers $Headers
    
    Show-Result "Statistiques recuperees" $Stats 200
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# 10. Test du refresh token (Flutter Token Management)
Write-Host "[10] Rafraichissement du token (Flutter Auth Interceptor)" -ForegroundColor Magenta
$RefreshBody = @{
    refresh = $RefreshToken
} | ConvertTo-Json

try {
    $RefreshResponse = Invoke-RestMethod -Uri "$ApiUrl/users/auth/refresh/" `
        -Method Post `
        -Body $RefreshBody `
        -ContentType "application/json"
    
    Show-Result "Token rafraichi" $RefreshResponse 200
    Write-Host "  Nouveau Access Token: $($RefreshResponse.access.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "[ERREUR] $_" -ForegroundColor Red
}

# Resume final
Write-Host "=" * 60
Write-Host "Tests d'integration Flutter termines !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes pour Flutter:" -ForegroundColor Cyan
Write-Host "  1. Configurer les dependances dans pubspec.yaml"
Write-Host "  2. Creer les modeles avec json_serializable"
Write-Host "  3. Implementer AuthService et ApiClient"
Write-Host "  4. Tester avec l'emulateur Android (10.0.2.2:8000)"
Write-Host "  5. Consulter FLUTTER_INTEGRATION.md pour plus de details"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - API: http://localhost:8000/swagger/"
Write-Host "  - Admin: http://localhost:8000/admin/"
Write-Host "  - Guide: FLUTTER_INTEGRATION.md"
Write-Host ""
