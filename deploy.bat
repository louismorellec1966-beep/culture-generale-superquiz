@echo off
title Deploiement Culture G Site
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "deploy.ps1"
