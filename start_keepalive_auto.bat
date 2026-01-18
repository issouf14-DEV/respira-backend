@echo off
REM ===================================================
REM RENDER KEEP-ALIVE - Démarrage automatique simple
REM ===================================================

echo [%TIME%] Demarrage du service Keep-Alive...

REM Aller dans le bon répertoire  
cd /d "c:\Users\fofan\Downloads\respira-backend-main\respira-backend-main"

REM Vérifier Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python non trouvé
    pause
    exit /b 1
)

echo [%TIME%] Python detecte, installation des dependances...
pip install requests >nul 2>&1

echo [%TIME%] Lancement du service keep-alive automatique...
echo.
echo ============================================
echo    RENDER KEEP-ALIVE SERVICE ACTIF
echo ============================================  
echo Target: https://respira-backend.onrender.com
echo Interval: 5 minutes
echo.
echo IMPORTANT: Laissez cette fenetre ouverte !
echo Pour arreter: Fermez cette fenetre
echo ============================================
echo.

REM Lancer le service en boucle avec restart automatique
:loop
echo [%TIME%] Demarrage du service...
python simple_keepalive.py
echo.
echo [%TIME%] Service interrompu, redemarrage dans 10 secondes...
timeout /t 10 /nobreak >nul
goto loop