#!/usr/bin/env powershell
# Script de mise a jour des packages de securite
# Corrige les vulnerabilites urllib3 et djangorestframework-simplejwt

Write-Host "MISE A JOUR DES PACKAGES DE SECURITE" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Activer l'environnement virtuel s'il existe
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Yellow
    & .venv\Scripts\Activate.ps1
}

# Mise a jour de pip
Write-Host "Mise a jour de pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Installation des versions corrigees
Write-Host "Installation des versions de securite..." -ForegroundColor Yellow

# Correction urllib3 - Vulnerabilites #55, #56, #57, #58
Write-Host "Correction urllib3 (streaming, compression, redirections)..." -ForegroundColor Cyan
pip install "urllib3>=2.5.1"

# Correction djangorestframework-simplejwt - Vulnerabilite #53
Write-Host "Correction djangorestframework-simplejwt (privileges)..." -ForegroundColor Cyan
pip install "djangorestframework-simplejwt>=5.7.0"

# Installation des autres packages de securite
Write-Host "Installation des packages de securite..." -ForegroundColor Yellow
pip install -r requirements_render.txt

# Verification des vulnerabilites
Write-Host "Verification des vulnerabilites..." -ForegroundColor Yellow
if (Get-Command safety -ErrorAction SilentlyContinue) {
    safety check
} else {
    pip install safety
    safety check
}

Write-Host "MISE A JOUR TERMINEE" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "urllib3 mis a jour vers 2.5.1+ (corrections streaming/compression/redirections)" -ForegroundColor Green
Write-Host "djangorestframework-simplejwt mis a jour vers 5.7.0+ (correction privileges)" -ForegroundColor Green
Write-Host "Cles API compromises supprimees du code source" -ForegroundColor Green

Write-Host ""
Write-Host "PROCHAINES ETAPES:" -ForegroundColor Blue
Write-Host "1. Definir de nouvelles cles API dans les variables d'environnement" -ForegroundColor White
Write-Host "2. Tester l'application avec les nouvelles versions" -ForegroundColor White
Write-Host "3. Deployer les corrections en production" -ForegroundColor White