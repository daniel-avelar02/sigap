# SIGAP - Sistema de Gestión de Agua Potable

![Idioma](https://img.shields.io/badge/Idioma-Español%20🇸🇻-blue)
![Laravel](https://img.shields.io/badge/Laravel-11.x-red)
![React](https://img.shields.io/badge/React-18.x-blue)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-purple)
![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4)
![License](https://img.shields.io/badge/Licencia-MIT-green)

Sistema integral de gestión para la administración de conexiones de agua potable, propietarios y facturación en comunidades de El Salvador.

## 📋 Descripción

SIGAP (Sistema de Gestión de Agua Potable) es una aplicación web moderna diseñada para facilitar la gestión y administración de servicios de agua potable en comunidades. El sistema permite gestionar propietarios, conexiones de agua, estados de pago y generar reportes de forma eficiente.

### Características principales

- 🔐 **Autenticación completa**: Sistema de inicio de sesión, registro y recuperación de contraseña
- 👥 **Gestión de propietarios**: Registro y administración de propietarios de conexiones
- 💧 **Gestión de conexiones de agua**: Control de pajas de agua, estados y configuración
- 💰 **Control de pagos**: Seguimiento de estados de pago mensuales
- 🌍 **Interfaz en español**: Toda la interfaz de usuario está completamente traducida
- 📱 **Diseño responsivo**: Interfaz adaptable a dispositivos móviles y de escritorio
- 🎨 **Logo personalizado**: Diseño único con gota de agua sobre tubería

## 🚀 Requisitos del sistema

Antes de instalar SIGAP, asegúrate de tener los siguientes requisitos:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **NPM** >= 9.x
- **MySQL** >= 8.0 o **SQLite** >= 3.x
- **Extensiones de PHP**:
  - BCMath
  - Ctype
  - Fileinfo
  - JSON
  - Mbstring
  - OpenSSL
  - PDO
  - Tokenizer
  - XML
- **Locale del sistema**: `es_SV.UTF-8` o `es_ES.UTF-8` (recomendado para El Salvador)

## 📦 Instalación

### Opción 1: Instalación automática (Recomendado)

#### Windows (PowerShell)
```powershell
.\install.ps1
```

#### Linux/macOS (Bash)
```bash
chmod +x install.sh
./install.sh
```

### Opción 2: Instalación manual

1. **Clonar el repositorio**
```bash
git clone https://github.com/daniel-avelar02/sigap.git
cd sigap
```

2. **Instalar dependencias de PHP**
```bash
composer install
```

3. **Instalar dependencias de JavaScript**
```bash
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configurar la base de datos**

Edita el archivo `.env` y configura tu conexión a la base de datos:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigap
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

6. **Ejecutar migraciones**
```bash
php artisan migrate
```

7. **Instalar traducciones en español**
```bash
php artisan lang:add es
```

8. **Compilar assets frontend**
```bash
npm run build
```

## ⚙️ Configuración

### Configuración de idioma

SIGAP está configurado en español por defecto. La configuración se encuentra en:

- **Archivo .env**:
```dotenv
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_ES
```

- **Zona horaria** (config/app.php):
```php
'timezone' => 'America/El_Salvador',
```

### Configuración de Carbon (fechas)

Las fechas se formatean automáticamente en español gracias a la configuración en `AppServiceProvider.php`:

```php
Carbon::setLocale('es');
```

### Traducciones personalizadas

Las traducciones específicas de SIGAP se encuentran en `lang/es/custom.php` y se pueden usar con:

```php
__('custom.water_connections')  // "Conexiones de agua"
__('custom.active')              // "Activo"
__('custom.search')              // "Buscar"
```

## 🎮 Uso

### Iniciar servidor de desarrollo

```bash
php artisan serve
```

La aplicación estará disponible en `http://localhost:8000`

### Compilar assets en modo desarrollo (con hot reload)

```bash
npm run dev
```

### Ejecutar tests

```bash
php artisan test
```

## 📁 Estructura del proyecto

```
sigap/
├── app/                      # Lógica de la aplicación
│   ├── Http/
│   │   ├── Controllers/      # Controladores
│   │   └── Requests/         # Request validation
│   ├── Models/               # Modelos Eloquent
│   └── Providers/            # Service providers
├── config/                   # Archivos de configuración
├── database/
│   ├── migrations/           # Migraciones de base de datos
│   └── seeders/              # Seeders de datos
├── lang/es/                  # Traducciones en español
├── public/                   # Archivos públicos
├── resources/
│   ├── css/                  # Estilos CSS
│   ├── js/                   # Componentes React
│   │   ├── Components/       # Componentes reutilizables
│   │   ├── Layouts/          # Layouts de la aplicación
│   │   └── Pages/            # Páginas de la aplicación
│   └── views/                # Vistas Blade
├── routes/                   # Definición de rutas
├── storage/                  # Almacenamiento de archivos
├── install.ps1               # Script de instalación Windows
└── install.sh                # Script de instalación Linux/macOS
```

## 🛠️ Stack tecnológico

### Backend
- **Laravel 11.x** - Framework PHP moderno
- **PHP 8.2+** - Lenguaje de programación
- **MySQL/SQLite** - Sistema de base de datos

### Frontend
- **React 18.x** - Biblioteca de JavaScript para interfaces
- **Inertia.js** - Adaptador SPA para Laravel
- **Tailwind CSS** - Framework de CSS utility-first
- **Vite** - Herramienta de compilación frontend

### Paquetes adicionales
- **laravel-lang/lang** - Traducciones de Laravel en español
- **laravel-lang/attributes** - Traducciones de atributos
- **laravel-lang/http-statuses** - Códigos HTTP en español
- **Carbon** - Manipulación de fechas en español

## 🌟 Características de localización

- ✅ Interfaz completamente en español
- ✅ Mensajes de validación traducidos
- ✅ Fechas y horas en formato español (América/El Salvador)
- ✅ Números y monedas formateados correctamente
- ✅ Traducciones personalizadas para módulos específicos
- ✅ Mensajes de error y éxito en español

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Daniel Avelar**
- GitHub: [@daniel-avelar02](https://github.com/daniel-avelar02)

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, por favor:

1. Revisa la [documentación de Laravel](https://laravel.com/docs)
2. Abre un [issue](https://github.com/daniel-avelar02/sigap/issues) en GitHub
3. Consulta la [guía de Inertia.js](https://inertiajs.com/)

---

Desarrollado con ❤️ en El Salvador 🇸🇻


In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
