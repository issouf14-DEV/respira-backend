@echo off
REM =============================================================
REM AUTO KEEP-ALIVE LAUNCHER - Démarre automatiquement au boot
REM =============================================================

echo 🔥 AUTO KEEP-ALIVE SERVICE
echo =========================
echo.

REM Se placer dans le bon répertoire
cd /d "c:\Users\fofan\Downloads\respira-backend-main\respira-backend-main"

REM Vérifier que Python est disponible
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Python n'est pas installé
    pause
    exit /b 1
)

REM Installer requests si nécessaire
echo 📦 Installation des dépendances...
pip install requests >nul 2>&1

echo 🚀 Démarrage du service keep-alive...
echo 🎯 Cible: https://respira-backend.onrender.com
echo ⏱️  Intervalle: 5 minutes
echo.
echo ⚠️  IMPORTANT: Laissez cette fenêtre ouverte !
echo    Le service s'arrêtera si vous fermez cette fenêtre.
echo.
echo 🛑 Pour arrêter: Fermez cette fenêtre ou appuyez Ctrl+C
echo ===============================================

REM Lancer le script keep-alive
python auto_keepalive.py

echo.
echo 🏁 Service keep-alive arrêté.
pause