@echo off
echo ========================================
echo   LOGITAP - Setup Completo PostgreSQL
echo ========================================
echo.

echo [1/5] Verificando PostgreSQL...
psql --version
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no encontrado. Instalalo primero.
    pause
    exit /b 1
)

echo.
echo [2/5] Creando base de datos y usuario...
psql -U postgres -f setup-postgres.sql
if %errorlevel% neq 0 (
    echo ❌ Error creando base de datos.
    echo Verifica que PostgreSQL este corriendo y la contraseña sea correcta.
    pause
    exit /b 1
)

echo.
echo [3/5] Generando Prisma Client...
call npx prisma generate

echo.
echo [4/5] Creando tablas en la base de datos...
call npx prisma db push --accept-data-loss

echo.
echo [5/5] Creando usuario administrador...
call npx tsx scripts/seed-admin.ts

echo.
echo ========================================
echo   ✅ SETUP COMPLETO
echo ========================================
echo.
echo Credenciales de login:
echo   Email: admin@logitap.com
echo   Password: Admin123
echo.
echo Inicia el servidor con: npm run dev
echo.
pause
