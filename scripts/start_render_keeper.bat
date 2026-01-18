@echo off
REM ===============================================
REM RENDER KEEPER LAUNCHER - Lancement automatique
REM ===============================================

echo 🔥 RENDER KEEPER - Service Keep-Alive Ultra-Robuste
echo ===================================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Python n'est pas installe ou pas dans le PATH
    echo 💡 Installez Python depuis python.org
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
echo 📦 Vérification des dépendances...
pip install requests >nul 2>&1

REM Menu de sélection
echo.
echo 🎯 Choisissez le mode de lancement:
echo.
echo 1. Mode Normal       (ping toutes les 8 minutes)
echo 2. Mode Agressif     (ping toutes les 5 minutes)  
echo 3. Mode Économe      (ping toutes les 12 minutes)
echo 4. Mode Custom       (intervalle personnalisé)
echo 5. Mode Daemon       (arrière-plan silencieux)
echo.

set /p choice="Votre choix (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Lancement en mode NORMAL...
    python "%~dp0render_keeper.py"
) else if "%choice%"=="2" (
    echo.
    echo ⚡ Lancement en mode AGRESSIF...
    python "%~dp0render_keeper.py" --aggressive
) else if "%choice%"=="3" (
    echo.
    echo 🌿 Lancement en mode ÉCONOME...
    python "%~dp0render_keeper.py" --interval 720
) else if "%choice%"=="4" (
    echo.
    set /p interval="Intervalle en secondes (300-900): "
    echo 🔧 Lancement avec intervalle %interval%s...
    python "%~dp0render_keeper.py" --interval %interval%
) else if "%choice%"=="5" (
    echo.
    echo 🤖 Lancement en mode DAEMON...
    python "%~dp0render_keeper.py" --daemon --interval 480
) else (
    echo ❌ Choix invalide!
    pause
    goto :eof
)

echo.
echo 🏁 Render Keeper terminé.
pause