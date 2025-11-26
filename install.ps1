# Script de instalación de SIGAP para Windows (PowerShell)
# Este script automatiza la configuración inicial del proyecto

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Instalador de SIGAP" -ForegroundColor Cyan
Write-Host "  Sistema de Gestión de Agua" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Instalar dependencias de Composer
Write-Host "[1/8] Instalando dependencias de Composer..." -ForegroundColor Yellow
if (Get-Command composer -ErrorAction SilentlyContinue) {
    composer install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Falló la instalación de dependencias de Composer" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Error: Composer no está instalado. Por favor instala Composer primero." -ForegroundColor Red
    exit 1
}

# Paso 2: Instalar dependencias de NPM
Write-Host "[2/8] Instalando dependencias de NPM..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Falló la instalación de dependencias de NPM" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Error: NPM no está instalado. Por favor instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Paso 3: Copiar archivo .env
Write-Host "[3/8] Configurando archivo .env..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Archivo .env creado desde .env.example" -ForegroundColor Green
} else {
    Write-Host "El archivo .env ya existe, omitiendo..." -ForegroundColor Gray
}

# Paso 4: Generar clave de aplicación
Write-Host "[4/8] Generando clave de aplicación..." -ForegroundColor Yellow
php artisan key:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Falló la generación de clave" -ForegroundColor Red
    exit 1
}

# Paso 5: Ejecutar migraciones
Write-Host "[5/8] Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
Write-Host "Asegúrate de que tu base de datos esté configurada en .env" -ForegroundColor Cyan
$response = Read-Host "¿Deseas ejecutar las migraciones ahora? (s/n)"
if ($response -eq "s" -or $response -eq "S") {
    php artisan migrate --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Advertencia: Las migraciones fallaron. Verifica tu configuración de base de datos." -ForegroundColor Yellow
    }
} else {
    Write-Host "Migraciones omitidas. Recuerda ejecutar 'php artisan migrate' más tarde." -ForegroundColor Gray
}

# Paso 6: Instalar traducciones de Laravel
Write-Host "[6/8] Instalando traducciones en español..." -ForegroundColor Yellow
php artisan lang:add es
if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia: Falló la instalación de traducciones" -ForegroundColor Yellow
}

# Paso 7: Limpiar caché
Write-Host "[7/8] Limpiando caché de la aplicación..." -ForegroundColor Yellow
php artisan optimize:clear
if ($LASTEXITCODE -ne 0) {
    Write-Host "Advertencia: Falló la limpieza de caché" -ForegroundColor Yellow
}

# Paso 8: Compilar assets
Write-Host "[8/8] Compilando assets frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Falló la compilación de assets" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  ✓ Instalación completada!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Configura tu base de datos en el archivo .env" -ForegroundColor White
Write-Host "2. Ejecuta 'php artisan migrate' si no lo hiciste aún" -ForegroundColor White
Write-Host "3. Ejecuta 'php artisan serve' para iniciar el servidor" -ForegroundColor White
Write-Host "4. Visita http://localhost:8000 en tu navegador" -ForegroundColor White
Write-Host ""
