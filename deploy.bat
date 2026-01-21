@echo off
chcp 65001 >nul
title Deploiement Culture G Site
cd /d "%~dp0"

echo.
echo ========================================
echo    DEPLOIEMENT CULTURE G SITE
echo ========================================
echo.

set FTP_HOST=147.93.54.141
set REMOTE_PATH=domains/cultureludo.com/public_html
set HOME=%~dp0

echo Deploiement des fichiers racine...
echo.

for %%f in (*.html *.js *.json *.txt *.xml) do (
    if /I not "%%f"=="deploy.ps1" if /I not "%%f"=="deploy.bat" (
        curl.exe -s -S -T "%%f" "ftp://%FTP_HOST%/%REMOTE_PATH%/%%f" --netrc --ftp-create-dirs
        if errorlevel 1 (
            echo [ERREUR] %%f
        ) else (
            echo [OK] %%f
        )
    )
)

curl.exe -s -S -T ".htaccess" "ftp://%FTP_HOST%/%REMOTE_PATH%/.htaccess" --netrc --ftp-create-dirs 2>nul
if errorlevel 1 (echo [ERREUR] .htaccess) else (echo [OK] .htaccess)

echo.
echo Deploiement du dossier CSS...
for %%f in (CSS\*.css) do (
    curl.exe -s -S -T "%%f" "ftp://%FTP_HOST%/%REMOTE_PATH%/CSS/%%~nxf" --netrc --ftp-create-dirs
    if errorlevel 1 (echo [ERREUR] CSS/%%~nxf) else (echo [OK] CSS/%%~nxf)
)

echo.
echo Deploiement du dossier js...
for %%f in (js\*.js) do (
    curl.exe -s -S -T "%%f" "ftp://%FTP_HOST%/%REMOTE_PATH%/js/%%~nxf" --netrc --ftp-create-dirs
    if errorlevel 1 (echo [ERREUR] js/%%~nxf) else (echo [OK] js/%%~nxf)
)

echo.
echo Deploiement du dossier Images...
for %%f in (Images\*.*) do (
    curl.exe -s -S -T "%%f" "ftp://%FTP_HOST%/%REMOTE_PATH%/Images/%%~nxf" --netrc --ftp-create-dirs
    if errorlevel 1 (echo [ERREUR] Images/%%~nxf) else (echo [OK] Images/%%~nxf)
)

echo.
echo ========================================
echo    DEPLOIEMENT TERMINE!
echo ========================================
echo.
pause
