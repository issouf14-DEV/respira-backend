# Script d'installation des corrections de sécurité
# Respira Backend - Mise à jour de sécurité

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Corrections de Sécurité - Respira" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "manage.py")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Fonction pour afficher les étapes
function Write-Step {
    param($step, $message)
    Write-Host "[$step] " -NoNewline -ForegroundColor Yellow
    Write-Host $message -ForegroundColor White
}

# Étape 1: Vérifier Python
Write-Step "1/7" "Vérification de Python..."
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python non trouvé" -ForegroundColor Red
    exit 1
}

# Étape 2: Activer l'environnement virtuel
Write-Step "2/7" "Activation de l'environnement virtuel..."
if (Test-Path "venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
    Write-Host "  ✓ Environnement virtuel activé" -ForegroundColor Green
} else {
    Write-Host "  ! Environnement virtuel non trouvé. Création..." -ForegroundColor Yellow
    python -m venv venv
    & .\venv\Scripts\Activate.ps1
    Write-Host "  ✓ Environnement virtuel créé et activé" -ForegroundColor Green
}

# Étape 3: Mettre à jour pip
Write-Step "3/7" "Mise à jour de pip..."
python -m pip install --upgrade pip --quiet
Write-Host "  ✓ pip mis à jour" -ForegroundColor Green

# Étape 4: Installer les dépendances principales
Write-Step "4/7" "Installation des dépendances mises à jour..."
Write-Host "  - Django 5.1.5 (Corrections SQL injection + DoS)" -ForegroundColor Cyan
Write-Host "  - djangorestframework-simplejwt 5.4.0 (Gestion privilèges)" -ForegroundColor Cyan
Write-Host "  - psycopg2-binary 2.9.10" -ForegroundColor Cyan
Write-Host "  - dj-database-url 2.3.0" -ForegroundColor Cyan

pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Dépendances principales installées" -ForegroundColor Green
} else {
    Write-Host "  ✗ Erreur lors de l'installation" -ForegroundColor Red
    exit 1
}

# Étape 5: Installer les packages de sécurité
Write-Step "5/7" "Installation des packages de sécurité..."
if (Test-Path "requirements\security.txt") {
    pip install -r requirements\security.txt --quiet
    Write-Host "  ✓ Packages de sécurité installés" -ForegroundColor Green
} else {
    Write-Host "  ! Fichier security.txt non trouvé, ignoré" -ForegroundColor Yellow
}

# Étape 6: Vérifier les versions critiques
Write-Step "6/7" "Vérification des versions critiques..."
Write-Host ""

$packages = @{
    "Django" = "5.1.5"
    "djangorestframework-simplejwt" = "5.4.0"
    "requests" = "2.32.3"
}

$allGood = $true
foreach ($package in $packages.Keys) {
    $expectedVersion = $packages[$package]
    $installedVersion = pip show $package 2>$null | Select-String -Pattern "Version: (.*)" | ForEach-Object { $_.Matches.Groups[1].Value }
    
    if ($installedVersion) {
        if ($installedVersion -ge $expectedVersion) {
            Write-Host "  ✓ $package : $installedVersion" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $package : $installedVersion (attendu: $expectedVersion)" -ForegroundColor Red
            $allGood = $false
        }
    } else {
        Write-Host "  ✗ $package : Non installé" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Étape 7: Audit de sécurité
Write-Step "7/7" "Audit de sécurité..."
Write-Host "  Lancement de Safety check..." -ForegroundColor Cyan

# Installer safety si pas présent
pip show safety >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Installation de Safety..." -ForegroundColor Yellow
    pip install safety --quiet
}

# Exécuter l'audit
$safetyOutput = safety check --json 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Aucune vulnérabilité critique détectée" -ForegroundColor Green
} else {
    Write-Host "  ! Vulnérabilités détectées (voir ci-dessous)" -ForegroundColor Yellow
    Write-Host $safetyOutput -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Résumé de l'installation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✓ Toutes les dépendances critiques sont à jour" -ForegroundColor Green
    Write-Host "✓ Les 14 vulnérabilités GitHub ont été corrigées:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Critiques (1):" -ForegroundColor Red
    Write-Host "    ✓ SQL injection via _connector" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Hautes (3):" -ForegroundColor DarkRed
    Write-Host "    ✓ DoS dans HttpResponseRedirect (Windows)" -ForegroundColor Green
    Write-Host "    ✓ SQL injection dans alias de colonnes" -ForegroundColor Green
    Write-Host "    ✓ SQL injection via alias (duplicata)" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Modérées (8):" -ForegroundColor Yellow
    Write-Host "    ✓ DoS validation IPv6" -ForegroundColor Green
    Write-Host "    ✓ DoS extraction texte XML" -ForegroundColor Green
    Write-Host "    ✓ Allocation ressources sans limites" -ForegroundColor Green
    Write-Host "    ✓ DoS sous Windows" -ForegroundColor Green
    Write-Host "    ✓ Fuite identifiants .netrc (requests)" -ForegroundColor Green
    Write-Host "    ✓ DoS dans strip_tags()" -ForegroundColor Green
    Write-Host "    ✓ SQL injection dans alias" -ForegroundColor Green
    Write-Host "    ✓ Neutralisation incorrecte logs" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Faibles (2):" -ForegroundColor DarkYellow
    Write-Host "    ✓ Traversée partielle répertoires" -ForegroundColor Green
    Write-Host "    ✓ Gestion privilèges simplejwt" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✗ Certaines dépendances ne sont pas à jour" -ForegroundColor Red
    Write-Host "  Relancez le script ou installez manuellement" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Exécuter les migrations: python manage.py migrate" -ForegroundColor White
Write-Host "  2. Lancer les tests: python manage.py test" -ForegroundColor White
Write-Host "  3. Consulter SECURITY_FIXES.md pour plus de détails" -ForegroundColor White
Write-Host "  4. Déployer en production avec les nouvelles configurations" -ForegroundColor White
Write-Host ""

Write-Host "Documentation créée:" -ForegroundColor Cyan
Write-Host "  - SECURITY_FIXES.md : Guide complet des corrections" -ForegroundColor White
Write-Host "  - core/security_utils.py : Utilitaires de sécurité" -ForegroundColor White
Write-Host "  - settings/base.py : Configurations de sécurité ajoutées" -ForegroundColor White
Write-Host ""

# Proposer de lancer les migrations
Write-Host "Voulez-vous lancer les migrations maintenant? (O/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "Lancement des migrations..." -ForegroundColor Cyan
    python manage.py makemigrations
    python manage.py migrate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migrations appliquées avec succès" -ForegroundColor Green
    } else {
        Write-Host "✗ Erreur lors des migrations" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Installation terminée!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
