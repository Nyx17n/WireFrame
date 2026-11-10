@echo off
setlocal
title WireFrame - Installation & Lancement
cd /d "%~dp0"

if not exist "%~dp0index.html" (
    color 0C
    echo ============================================================================
    echo   [!] ATTENTION : Archive .zip non extraite !
    echo ============================================================================
    echo.
    echo   Vous avez lance WireFrame directement depuis l'interieur du fichier .zip.
    echo   Faites Clic droit sur WireFrame.zip -^> "Extraire tout..." dans un dossier,
    echo   puis relancez WireFrame.bat depuis ce dossier extrait !
    echo.
    pause
    exit /b 1
)

set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist "%CSC_EXE%" set "CSC_EXE=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\csc.exe"

if not exist "%~dp0WireFrame.exe" (
    if exist "%CSC_EXE%" (
        echo [WireFrame] Installation et creation de WireFrame.exe en cours...
        "%CSC_EXE%" /nologo /target:winexe /out:"%~dp0WireFrame.exe" /win32icon:"%~dp0logo.ico" /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll "%~dp0Launcher.cs" >nul 2>&1
    )
)

if exist "%~dp0WireFrame.exe" (
    start "" "%~dp0WireFrame.exe"
    exit /b 0
)

set "PORT=8484"
set "APP_URL=http://127.0.0.1:8484"
start "WireFrame Server" /min cmd /c "python "%~dp0server.py" %PORT%"
timeout /t 1 /nobreak >nul
start "" "%APP_URL%"
exit /b 0