@echo off
echo ==================================================
echo      COONTRASURES - INSTALADOR AUTOMATICO
echo ==================================================
echo.
echo [1/2] Instalando dependencias del BACKEND (server)...
cd server
if exist package.json (
    call npm install
    if errorlevel 1 goto error
) else (
    echo [ERROR] No se encontro la carpeta server o package.json
    goto error
)
cd ..
echo.
echo [2/2] Instalando dependencias del FRONTEND (raiz)...
if exist package.json (
    call npm install
    if errorlevel 1 goto error
) else (
    echo [ERROR] No se encontro package.json en la raiz
    goto error
)

echo.
echo ==================================================
echo      INSTALACION COMPLETADA CON EXITO
echo ==================================================
echo Ya puedes ejecutar el proyecto con 'npm run dev'
pause
exit /b 0

:error
echo.
echo [ERROR] Ocurrio un error durante la instalacion.
pause
exit /b 1
