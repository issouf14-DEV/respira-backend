# Script de test complet de l'API RespirIA
# PowerShell

Write-Host "=== Tests de l'API RespirIA ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api/v1"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        if ($Body) {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -Body $Body -ContentType 'application/json' -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -ErrorAction Stop
        }
        
        Write-Host "✓ $Name" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
        
        $script:testResults += @{
            Name = $Name
            Status = "PASS"
            StatusCode = $response.StatusCode
        }
        
        return $response
    }
    catch {
        Write-Host "✗ $Name" -ForegroundColor Red
        Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
        
        $script:testResults += @{
            Name = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }
        
        return $null
    }
}

Write-Host "1. Test de la documentation Swagger" -ForegroundColor Yellow
Test-Endpoint -Name "Swagger UI" -Url "$baseUrl/../swagger/"
Write-Host ""

Write-Host "2. Tests d'authentification" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    email = "test$timestamp@respira.com"
    username = "test$timestamp"
    password = "TestPass123!"
    password_confirm = "TestPass123!"
    profile_type = "ASTHMATIC"
    first_name = "Test"
    last_name = "User"
} | ConvertTo-Json

$registerResponse = Test-Endpoint -Name "Inscription" -Url "$baseUrl/users/auth/register/" -Method POST -Body $registerBody

if ($registerResponse) {
    $tokens = ($registerResponse.Content | ConvertFrom-Json).tokens
    $headers = @{
        Authorization = "Bearer $($tokens.access)"
    }
    
    Write-Host "  Token reçu: $($tokens.access.Substring(0, 50))..." -ForegroundColor Gray
}
Write-Host ""

Write-Host "3. Tests des endpoints utilisateur" -ForegroundColor Yellow
Test-Endpoint -Name "Profil utilisateur" -Url "$baseUrl/users/me/" -Headers $headers
Test-Endpoint -Name "Détails du profil" -Url "$baseUrl/users/me/profile/" -Headers $headers
Write-Host ""

Write-Host "4. Tests des capteurs" -ForegroundColor Yellow
$sensorData = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    spo2 = 98
    heart_rate = 75
    respiratory_rate = 16
    temperature = 36.8
    activity_level = "REST"
    risk_score = 25
} | ConvertTo-Json

Test-Endpoint -Name "Envoi de données capteur" -Url "$baseUrl/sensors/data/" -Method POST -Headers $headers -Body $sensorData
Test-Endpoint -Name "Dernières données" -Url "$baseUrl/sensors/data/latest/" -Headers $headers
Test-Endpoint -Name "Score de risque" -Url "$baseUrl/sensors/data/risk_score/" -Headers $headers
Test-Endpoint -Name "Statistiques 24h" -Url "$baseUrl/sensors/data/stats/?period=24h" -Headers $headers
Test-Endpoint -Name "Liste des données" -Url "$baseUrl/sensors/data/" -Headers $headers
Test-Endpoint -Name "Liste des appareils" -Url "$baseUrl/sensors/devices/" -Headers $headers
Write-Host ""

Write-Host "5. Tests environnement" -ForegroundColor Yellow
Test-Endpoint -Name "Qualité air Abidjan" -Url "$baseUrl/environment/air-quality/current/?city=Abidjan" -Headers $headers
Test-Endpoint -Name "Météo Abidjan" -Url "$baseUrl/environment/weather/current/?city=Abidjan" -Headers $headers
Test-Endpoint -Name "Liste qualité air" -Url "$baseUrl/environment/air-quality/" -Headers $headers
Test-Endpoint -Name "Liste météo" -Url "$baseUrl/environment/weather/" -Headers $headers
Write-Host ""

Write-Host "=== Résumé des tests ===" -ForegroundColor Cyan
$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $testResults.Count

Write-Host "Total: $totalCount tests" -ForegroundColor White
Write-Host "Réussis: $passCount" -ForegroundColor Green
Write-Host "Échoués: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✓ Tous les tests sont passés avec succès!" -ForegroundColor Green
} else {
    Write-Host "⚠ Certains tests ont échoué. Vérifiez les détails ci-dessus." -ForegroundColor Yellow
}
