@echo off
title Servidor Local - Nomina y Gastos Web
echo Iniciando servidor local...
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
