# Script de verification complete du backend RespirIA
# PowerShell

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         VERIFICATION COMPLETE DU BACKEND RESPIRA            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$allOk = $true

# 1. Verifier Docker
Write-Host "1. Verification Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "   ✓ Docker installe: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker non trouve" -ForegroundColor Red
        $allOk = $false
    }
} catch {
    Write-Host "   ✗ Erreur Docker" -ForegroundColor Red
    $allOk = $false
}

# 2. Verifier les conteneurs
Write-Host "`n2. Verification des conteneurs..." -ForegroundColor Yellow
$containers = docker compose ps --format json 2>$null | ConvertFrom-Json
if ($containers) {
    foreach ($container in $containers) {
        $status = if ($container.State -eq "running") { "✓" } else { "✗" }
        $color = if ($container.State -eq "running") { "Green" } else { "Red" }
        Write-Host "   $status $($container.Service): $($container.State)" -ForegroundColor $color
        if ($container.State -ne "running") { $allOk = $false }
    }
} else {
    Write-Host "   ✗ Aucun conteneur actif" -ForegroundColor Red
    $allOk = $false
}

# 3. Verifier la connectivite API
Write-Host "`n3. Verification de l'API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -ErrorAction Stop -TimeoutSec 5
    Write-Host "   ✓ API accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ API non accessible" -ForegroundColor Red
    $allOk = $false
}

# 4. Tester l'authentification
Write-Host "`n4. Test d'authentification..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = 'test@respira.com'
        password = 'SecureTestPass123!'
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri http://localhost:8000/api/v1/users/auth/login/ -Method POST -Body $loginBody -ContentType 'application/json' -ErrorAction Stop
    $tokens = $response.Content | ConvertFrom-Json
    
    if ($tokens.access) {
        Write-Host "   ✓ Authentification OK" -ForegroundColor Green
        $headers = @{Authorization = "Bearer $($tokens.access)"}
    } else {
        Write-Host "   ✗ Token non recu" -ForegroundColor Red
        $allOk = $false
    }
} catch {
    Write-Host "   ✗ Echec authentification" -ForegroundColor Red
    $allOk = $false
}

# 5. Tester les endpoints
Write-Host "`n5. Test des endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{Name="Profil"; Url="http://localhost:8000/api/v1/users/me/"; Method="GET"},
    @{Name="Capteurs"; Url="http://localhost:8000/api/v1/sensors/data/"; Method="GET"},
    @{Name="Qualite air"; Url="http://localhost:8000/api/v1/environment/air-quality/current/"; Method="GET"},
    @{Name="Meteo"; Url="http://localhost:8000/api/v1/environment/weather/current/"; Method="GET"}
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -Headers $headers -ErrorAction Stop -TimeoutSec 5
        Write-Host "   ✓ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ $($endpoint.Name): Erreur" -ForegroundColor Red
        $allOk = $false
    }
}

# 6. Verifier la base de donnees
Write-Host "`n6. Verification base de donnees..." -ForegroundColor Yellow
try {
    $dbCheck = docker compose exec -T db psql -U respira_user -d respira_db -c "\dt" 2>$null
    if ($dbCheck) {
        Write-Host "   ✓ PostgreSQL accessible" -ForegroundColor Green
    } else {
        Write-Host "   ✗ PostgreSQL non accessible" -ForegroundColor Red
        $allOk = $false
    }
} catch {
    Write-Host "   ⚠ Verification PostgreSQL impossible" -ForegroundColor Yellow
}

# 7. Verifier les dependances
Write-Host "`n7. Verification des dependances..." -ForegroundColor Yellow
try {
    $pipList = docker compose exec -T web pip list 2>$null
    $requiredPackages = @("Django", "djangorestframework", "psycopg2", "requests")
    
    foreach ($package in $requiredPackages) {
        if ($pipList -match $package) {
            Write-Host "   ✓ $package installe" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $package manquant" -ForegroundColor Red
            $allOk = $false
        }
    }
} catch {
    Write-Host "   ⚠ Verification dependances impossible" -ForegroundColor Yellow
}

# 8. Verifier les fichiers de configuration
Write-Host "`n8. Verification configuration..." -ForegroundColor Yellow
$configFiles = @(".env", "docker-compose.yml", "Dockerfile", "requirements/base.txt")

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file present" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file manquant" -ForegroundColor Red
        $allOk = $false
    }
}

# Resultat final
Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
if ($allOk) {
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║         ✓ TOUS LES TESTS PASSES AVEC SUCCES ✓               ║" -ForegroundColor Green
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║         Le backend est 100% operationnel!                   ║" -ForegroundColor Green
} else {
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║         ⚠ CERTAINS TESTS ONT ECHOUE ⚠                       ║" -ForegroundColor Yellow
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║         Consultez TROUBLESHOOTING.md pour aide              ║" -ForegroundColor Yellow
}
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Afficher les informations d'acces
if ($allOk) {
    Write-Host "`nACCES RAPIDE:" -ForegroundColor Yellow
    Write-Host "  • API:        http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  • Admin:      http://localhost:8000/admin" -ForegroundColor Cyan
    Write-Host "  • Swagger:    http://localhost:8000/swagger/" -ForegroundColor Cyan
    Write-Host "`nCOMPTES DE TEST:" -ForegroundColor Yellow
    Write-Host "  • Email:      test@respira.com" -ForegroundColor Cyan
    Write-Host "  • Password:   SecureTestPass123!" -ForegroundColor Cyan
}

Write-Host ""
