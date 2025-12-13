# Script de preparation au deploiement Render
# Genere une SECRET_KEY securisee pour Django

Write-Host ""
Write-Host "Preparation au deploiement Render..." -ForegroundColor Cyan
Write-Host ""

# Generation d'une SECRET_KEY Django securisee
Write-Host "Generation d'une SECRET_KEY securisee..." -ForegroundColor Yellow

$characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^*-_=+'
$secretKey = -join ((1..75) | ForEach-Object { $characters[(Get-Random -Minimum 0 -Maximum $characters.Length)] })

Write-Host ""
Write-Host "SECRET_KEY generee avec succes !" -ForegroundColor Green
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "COPIEZ CETTE CLE DANS RENDER (Variables environnement)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SECRET_KEY=$secretKey" -ForegroundColor White
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Sauvegarder dans un fichier temporaire (a ne PAS commiter)
$secretKey | Out-File -FilePath "SECRET_KEY.txt" -NoNewline -Encoding UTF8

Write-Host "La cle a ete sauvegardee dans SECRET_KEY.txt" -ForegroundColor Green
Write-Host "NE COMMITTEZ PAS ce fichier dans Git !" -ForegroundColor Red
Write-Host ""

# Verification des fichiers necessaires
Write-Host "Verification des fichiers de deploiement..." -ForegroundColor Yellow
Write-Host ""

$requiredFiles = @(
    "build.sh",
    "Procfile",
    "requirements_render.txt",
    "respira_project\settings\production.py"
)

$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK $file" -ForegroundColor Green
    } else {
        Write-Host "  MANQUANT $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if ($allFilesExist) {
    Write-Host "Tous les fichiers necessaires sont presents !" -ForegroundColor Green
} else {
    Write-Host "Certains fichiers sont manquants. Veuillez verifier." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "CHECKLIST DE DEPLOIEMENT RENDER" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$checklist = @(
    "Compte Render cree (https://render.com)",
    "Code pousse sur GitHub",
    "Base de donnees PostgreSQL creee sur Render",
    "URL de la base de donnees copiee (DATABASE_URL)",
    "SECRET_KEY copiee (voir ci-dessus)",
    "Cles API IQAir et OpenWeatherMap pretes"
)

foreach ($item in $checklist) {
    Write-Host "  [ ] $item" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "VARIABLES D'ENVIRONNEMENT A CONFIGURER SUR RENDER" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$envVars = @"
# OBLIGATOIRES
SECRET_KEY=$secretKey
DJANGO_SETTINGS_MODULE=respira_project.settings.production
DATABASE_URL=postgresql://user:password@host/database
PYTHON_VERSION=3.11.0
RENDER=True

# API EXTERNES (optionnel mais recommande)
IQAIR_API_KEY=votre_cle_iqair
OPENWEATHERMAP_API_KEY=votre_cle_openweathermap

# SECURITE (optionnel)
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://votre-frontend.com
"@

Write-Host $envVars -ForegroundColor White
Write-Host ""

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "PROCHAINES ETAPES" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Ouvrez le guide de déploiement :" -ForegroundColor White
Write-Host "   RENDER_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Suivez les etapes du guide :" -ForegroundColor White
Write-Host "   - Creer la base de donnees PostgreSQL" -ForegroundColor Cyan
Write-Host "   - Creer le Web Service" -ForegroundColor Cyan
Write-Host "   - Configurer les variables d'environnement" -ForegroundColor Cyan
Write-Host "   - Deployer !" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Une fois deploye, testez votre API :" -ForegroundColor White
Write-Host "   https://respira-backend.onrender.com/api/v1/" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Preparation terminee ! Bon deploiement !" -ForegroundColor Green
Write-Host ""
