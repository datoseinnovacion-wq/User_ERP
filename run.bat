@echo off
setlocal enabledelayedexpansion
title Link 1.720 - Plataforma Web Unificada Multi-Modulo
echo ========================================================
echo   LINK 1.720 Agentes Aduanales S.A.
echo   Plataforma Centralizada de Repositorios (SSO)
echo ========================================================
echo Iniciando todos los repositorios en vivo:
echo   [1] Sistema SEA 1.720 Web                  : Puerto 43123
echo   [2] Sistema SEA 1.720 API                  : Puerto 43124
echo   [3] Asignacion Vehicular                   : Puerto 8002
echo   [4] Preliquidaciones                       : Puerto 8090
echo   [5] Finanzas y Bancos (CxP)                : Puerto 8001
echo   [6] Gateway SSO Central                    : Puerto 8000
echo   [7] Portal Web Frontend                    : Puerto 3000
echo   [*] Modulo Resguardo                       : EXCLUIDO
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "LINK_DIR=%SCRIPT_DIR%..\..\Link"

if not exist "%LINK_DIR%\Link-Modulo_Asignacion_Vehicular" (
    if exist "%SCRIPT_DIR%..\Link\Link-Modulo_Asignacion_Vehicular" (
        set "LINK_DIR=%SCRIPT_DIR%..\Link"
    ) else if exist "%SCRIPT_DIR%..\Link-Modulo_Asignacion_Vehicular" (
        set "LINK_DIR=%SCRIPT_DIR%.."
    )
)

echo Directorio de modulos Link detectado: %LINK_DIR%

set "PYTHON_EXEC=python"
if exist "%LINK_DIR%\Link-Modulo_Asignacion_Vehicular\.venv\Scripts\python.exe" (
    set "PYTHON_EXEC=%LINK_DIR%\Link-Modulo_Asignacion_Vehicular\.venv\Scripts\python.exe"
)

echo Usando interprete Python: %PYTHON_EXEC%
echo.

echo [1/6] Iniciando Sistema SEA 1.720 API en puerto 43124...
start "Link 1.720 - SEA API (43124)" cmd /c "cd /d "%LINK_DIR%\sea-link1720-main\apps\api" && npm.cmd run start"

echo [2/6] Iniciando Sistema SEA 1.720 Web en puerto 43123...
start "Link 1.720 - SEA Web (43123)" cmd /c "cd /d "%LINK_DIR%\sea-link1720-main\apps\web" && npm.cmd run dev"

echo [3/6] Iniciando Modulo-Finanzas en puerto 8001...
start "Link 1.720 - Finanzas (8001)" "%PYTHON_EXEC%" -m uvicorn main:app --host 127.0.0.1 --port 8001 --app-dir "%LINK_DIR%\Modulo-Finanzas"

echo [4/6] Iniciando Link_Preliquidaciones en puerto 8090...
start "Link 1.720 - Preliquidaciones (8090)" "%PYTHON_EXEC%" -m uvicorn app.main:app --host 127.0.0.1 --port 8090 --app-dir "%LINK_DIR%\Link_Preliquidaciones"

echo [5/6] Iniciando Link-Modulo_Asignacion_Vehicular en puerto 8002...
start "Link 1.720 - Asignacion Vehicular (8002)" "%PYTHON_EXEC%" -m uvicorn main:app --host 127.0.0.1 --port 8002 --app-dir "%LINK_DIR%\Link-Modulo_Asignacion_Vehicular"

echo [6/6] Iniciando Gateway Central SSO en puerto 8000...
start "Link 1.720 - Gateway SSO (8000)" "%PYTHON_EXEC%" main.py

echo Iniciando Portal Web Unificado en puerto 3000...
call npm.cmd run dev

pause
