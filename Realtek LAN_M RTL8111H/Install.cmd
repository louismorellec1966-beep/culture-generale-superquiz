@echo off
REM Create by MVP v2.0.8.4
title Installing Realtek LAN_M RTL8111H
if not exist C:\OEM\AcerLogs md C:\OEM\AcerLogs
SET LogPath=C:\OEM\AcerLogs\DriverInstallation.log
ECHO.>>%LogPath%
ECHO Installing, please wait...
pushd "%~dp0"

ECHO %DATE% %TIME%[Log START]  ============ %~dpnx0 ============ >> %LogPath%

if exist C:\OEM\Preload\Command\POP*.ini ECHO [Realtek LAN_M RTL8111H]>> C:\OEM\Preload\OEMINFLIST.ini
for /f "tokens=*" %%v in (InfFiles.txt) do (
    ECHO %DATE% %TIME%[Log TRACE]  pnputil /add-driver "%%v" /install >> %LogPath%
    pnputil /add-driver "%%v" /install >> %LogPath% 2>&1
    ECHO %DATE% %TIME%[Log TRACE]  pnputil -i -a "%%v" >> %LogPath%
    pnputil -i -a "%%v" >> %LogPath% 2>&1
    ECHO.>>%LogPath%

    for /f "skip=1 tokens=2 delims=,;" %%s in ('find /i "DriverVer" "%%v"') do (
        if exist C:\OEM\Preload\Command\POP*.ini ECHO %%~nxv=%%s>> C:\OEM\Preload\OEMINFLIST.ini
    )
)
if exist C:\OEM\Preload\Command\POP*.ini ECHO.>> C:\OEM\Preload\OEMINFLIST.ini

ECHO %DATE% %TIME%[Log Leave]  ============ %~dpnx0 ============ >> %LogPath%
ECHO.>>%LogPath%

popd
ECHO Install finished
