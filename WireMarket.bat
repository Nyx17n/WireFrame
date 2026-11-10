@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title WireFrame - Launcher ^& Proxy Warframe Market
cd /d "%~dp0"

set "PORT=8484"
set "APP_URL=http://127.0.0.1:%PORT%"

cls
color 0B
echo ============================================================================
echo   _       ___           ______                        
echo  ^| ^|     / (_)_______  / ____/________ _____ ___  ___ 
echo  ^| ^| /^| / / / ___/ _ \/ /_  / ___/ __ `/ __ `__ \/ _ \
echo  ^| ^|/ ^|/ / / /  /  __/ __/ / /  / /_/ / / / / / /  __/
echo  ^|__/^|__/_/_/   \___/_/   /_/   \__,_/_/ /_/ /_/\___/ 
echo.
echo   WireFrame — Warframe Companion ^& Market (https://warframe.market)
echo   Cree par Nyxo_17
echo ============================================================================
echo.

:: Verification si le serveur tourne deja sur le port %PORT%
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri '%APP_URL%/__health' -UseBasicParsing -TimeoutSec 1; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Le serveur local WireFrame est deja actif sur %APP_URL%
) else (
    echo [1/2] Demarrage du serveur local ^& Proxy API Warframe Market sur le port %PORT%...
    if not exist "%~dp0WireMarket.exe" (
        if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
            echo [INFO] Compilation automatique de WireMarket.exe depuis Launcher.cs...
            "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:winexe /out:"%~dp0WireMarket.exe" /win32icon:"%~dp0logo.ico" /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll "%~dp0Launcher.cs" >nul 2>&1
        )
    )
    if exist "%~dp0WireMarket.exe" (
        start "WireFrame Server" /min "%~dp0WireMarket.exe" --server "%~dp0"
    ) else (
        start "WireFrame Server" /min cmd /c "python "%~dp0server.py" %PORT%"
    )
    
    :: Attente que le serveur reponde
    set /a TRIES=0
    :wait_loop
    set /a TRIES+=1
    powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri '%APP_URL%/__health' -UseBasicParsing -TimeoutSec 1; exit 0 } catch { exit 1 }" >nul 2>&1
    if !errorlevel! neq 0 (
        if !TRIES! lss 15 (
            timeout /t 1 /nobreak >nul
            goto wait_loop
        )
    )
    echo [OK] Serveur connecte a https://api.warframe.market
)

echo [2/2] Ouverture de l'application WireFrame en mode fenetre dediee...
call :launch_app_window

:menu
echo.
echo ============================================================================
echo   WireFrame est en cours d'execution sur %APP_URL%
echo ----------------------------------------------------------------------------
echo   [1] Ouvrir une nouvelle fenetre d'application WireFrame
echo   [2] Ouvrir WireFrame dans le navigateur par defaut
echo   [Q] Fermer le serveur local et quitter WireFrame
echo ============================================================================
choice /c 12Q /n /m "Votre choix (1, 2, Q) : "

if errorlevel 3 goto quit_app
if errorlevel 2 (
    start "" "%APP_URL%"
    goto menu
)
if errorlevel 1 (
    call :launch_app_window
    goto menu
)
goto menu

:launch_app_window
:: Recherche de Microsoft Edge ou Google Chrome pour le mode --app (sans bordures navigateur)
set "BROWSER_EXE="

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if defined BROWSER_EXE (
    start "" "!BROWSER_EXE!" --app="%APP_URL%" --window-size=1440,900
) else (
    start "" "%APP_URL%"
)
exit /b 0

:quit_app
echo.
echo [INFO] Arret du serveur local WireMarket...
taskkill /FI "WINDOWTITLE eq WireMarket Server*" /F >nul 2>&1
echo [OK] Serveur arrete. Bon jeu Tenno !
timeout /t 1 >nul
exit /b 0

