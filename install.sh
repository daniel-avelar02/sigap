#!/bin/bash

# Script de instalación de SIGAP para Linux/macOS (Bash)
# Este script automatiza la configuración inicial del proyecto

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # Sin color

echo -e "${CYAN}=================================="
echo -e "  Instalador de SIGAP"
echo -e "  Sistema de Gestión de Agua"
echo -e "==================================${NC}"
echo ""

# Paso 1: Instalar dependencias de Composer
echo -e "${YELLOW}[1/8] Instalando dependencias de Composer...${NC}"
if command -v composer &> /dev/null; then
    composer install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Falló la instalación de dependencias de Composer${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: Composer no está instalado. Por favor instala Composer primero.${NC}"
    exit 1
fi

# Paso 2: Instalar dependencias de NPM
echo -e "${YELLOW}[2/8] Instalando dependencias de NPM...${NC}"
if command -v npm &> /dev/null; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Falló la instalación de dependencias de NPM${NC}"
        exit 1
    fi
else
    echo -e "${RED}Error: NPM no está instalado. Por favor instala Node.js primero.${NC}"
    exit 1
fi

# Paso 3: Copiar archivo .env
echo -e "${YELLOW}[3/8] Configurando archivo .env...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}Archivo .env creado desde .env.example${NC}"
else
    echo -e "${YELLOW}El archivo .env ya existe, omitiendo...${NC}"
fi

# Paso 4: Generar clave de aplicación
echo -e "${YELLOW}[4/8] Generando clave de aplicación...${NC}"
php artisan key:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló la generación de clave${NC}"
    exit 1
fi

# Paso 5: Ejecutar migraciones
echo -e "${YELLOW}[5/8] Ejecutando migraciones de base de datos...${NC}"
echo -e "${CYAN}Asegúrate de que tu base de datos esté configurada en .env${NC}"
read -p "¿Deseas ejecutar las migraciones ahora? (s/n): " response
if [ "$response" = "s" ] || [ "$response" = "S" ]; then
    php artisan migrate --force
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Advertencia: Las migraciones fallaron. Verifica tu configuración de base de datos.${NC}"
    fi
else
    echo -e "${YELLOW}Migraciones omitidas. Recuerda ejecutar 'php artisan migrate' más tarde.${NC}"
fi

# Paso 6: Instalar traducciones de Laravel
echo -e "${YELLOW}[6/8] Instalando traducciones en español...${NC}"
php artisan lang:add es
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Advertencia: Falló la instalación de traducciones${NC}"
fi

# Paso 7: Limpiar caché
echo -e "${YELLOW}[7/8] Limpiando caché de la aplicación...${NC}"
php artisan optimize:clear
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Advertencia: Falló la limpieza de caché${NC}"
fi

# Paso 8: Compilar assets
echo -e "${YELLOW}[8/8] Compilando assets frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Falló la compilación de assets${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=================================="
echo -e "  ✓ Instalación completada!"
echo -e "==================================${NC}"
echo ""
echo -e "${CYAN}Pasos siguientes:${NC}"
echo -e "${NC}1. Configura tu base de datos en el archivo .env${NC}"
echo -e "${NC}2. Ejecuta 'php artisan migrate' si no lo hiciste aún${NC}"
echo -e "${NC}3. Ejecuta 'php artisan serve' para iniciar el servidor${NC}"
echo -e "${NC}4. Visita http://localhost:8000 en tu navegador${NC}"
echo ""

# Hacer el script ejecutable
chmod +x "$0"
