# LegacyWaterConnectionSeeder - Documentación

## Propósito

Este seeder crea datos de prueba para pajas de agua con fechas históricas (legacy) para verificar el correcto funcionamiento del sistema de billing híbrido implementado en el módulo de pagos mensuales.

## Datos que Crea

### Pajas Legacy (2010-2024) - 30 pajas
- **8 pajas muy antiguas** (2010-2015): Simula pajas con hasta 14 años de antigüedad
- **10 pajas antiguas** (2016-2020): Simula pajas con 5-9 años de antigüedad  
- **12 pajas recientes pre-2025** (2021-2024): Simula pajas creadas antes del sistema de billing

**Comportamiento esperado:** Todas estas pajas deben mostrar meses pendientes **desde Enero 2025** en adelante, independientemente de su `created_at`, debido a la lógica híbrida de billing.

### Pajas Nuevas (2025) - 5 pajas
- Creadas en diferentes meses de 2025 (después del inicio del sistema de billing)

**Comportamiento esperado:** Estas pajas deben mostrar meses pendientes **desde su fecha de creación** (`created_at`).

## Estados de Pago

El seeder distribuye las pajas con diferentes estados de pago para verificar el componente `PaymentStatusBadge`:

- **20%** - Al día (`al_dia`)
- **30%** - En mora mensual (`en_mora`)
- **15%** - En mora + mora medidor
- **13%** - En mora + mora instalación
- **10%** - Solo mora medidor
- **6%** - Todas las moras (caso problemático)
- **4%** - Mora medidor + instalación
- **2%** - Solo mora instalación

## Uso

### Opción 1: Ejecutar todos los seeders (recomendado)

```bash
# Refrescar base de datos y ejecutar todos los seeders
php artisan migrate:fresh --seed
```

Esto ejecutará:
1. `UserSeeder` (usuario de prueba)
2. `OwnerSeeder` (propietarios)
3. `LegacyWaterConnectionSeeder` (pajas legacy + nuevas)

### Opción 2: Ejecutar solo el seeder de pajas legacy

```bash
# Primero asegúrate de tener propietarios
php artisan db:seed --class=OwnerSeeder

# Luego ejecuta el seeder de pajas legacy
php artisan db:seed --class=LegacyWaterConnectionSeeder
```

### Opción 3: Usar el seeder básico (sin datos legacy)

Si prefieres datos aleatorios sin fechas históricas:

```bash
php artisan db:seed --class=WaterConnectionSeeder
```

## Verificación del Sistema

Después de ejecutar el seeder, verifica lo siguiente:

### 1. Lógica de Billing Híbrida

**Pajas Legacy (created_at < 2025-01-01):**
- ✅ Busca una paja creada en 2010, 2015, o 2020
- ✅ Debe mostrar meses pendientes desde **Enero 2025** hasta el mes actual (2025)
- ✅ Ejemplo: Una paja de 2010 debe mostrar 11 meses pendientes (Ene-Nov 2025)

**Pajas Nuevas (created_at >= 2025-01-01):**
- ✅ Busca una paja creada en Junio 2025
- ✅ Debe mostrar meses pendientes desde **Junio 2025** hasta el mes actual
- ✅ Ejemplo: Una paja de Junio 2025 debe mostrar 6 meses pendientes (Jun-Nov 2025)

### 2. Visualización de Estados de Pago

En `MonthlyPayments/Create.jsx`:
- ✅ Los badges de estado de pago deben mostrarse correctamente
- ✅ Una paja con `['en_mora', 'en_mora_medidor']` debe mostrar 2 badges rojos/naranjas
- ✅ Una paja con `['al_dia']` debe mostrar 1 badge verde

### 3. Búsqueda de Pajas

En el componente `WaterConnectionSearchDropdown`:
- ✅ No debe mostrar el código interno (WC-XXXXX)
- ✅ Debe mostrar formato: `#123 - Nombre del Propietario`
- ✅ Debe mostrar alerta de meses pendientes si aplica

### 4. Vista de Meses Pendientes

En la sección de información de la paja:
- ✅ Debe mostrarse en grid horizontal compacto (2-6 columnas)
- ✅ Debe mostrar TODOS los meses pendientes (sin truncar)
- ✅ Debe ocupar menos espacio vertical que la lista anterior

## Códigos de Pajas Creadas

Las pajas legacy usan códigos desde **WC-01001** en adelante para diferenciarlas fácilmente de las pajas del seeder básico.

## Ejemplos de Prueba

### Caso 1: Paja legacy muy antigua
```
Código: WC-01001
Creada: 15/03/2010
Meses pendientes esperados: Enero 2025 - Noviembre 2025 (11 meses)
```

### Caso 2: Paja nueva de 2025
```
Código: WC-01031
Creada: 15/06/2025  
Meses pendientes esperados: Junio 2025 - Noviembre 2025 (6 meses)
```

### Caso 3: Paja reciente pre-2025
```
Código: WC-01020
Creada: 20/12/2024
Meses pendientes esperados: Enero 2025 - Noviembre 2025 (11 meses)
```

## Troubleshooting

**Error: No hay propietarios registrados**
```bash
php artisan db:seed --class=OwnerSeeder
```

**Error: SQLSTATE[23000]: Integrity constraint violation**
- La base de datos ya tiene datos. Ejecuta `php artisan migrate:fresh --seed`

**Los meses pendientes no se calculan correctamente**
- Verifica que la migración de `monthly_billing_start_date` se haya ejecutado
- Verifica que `SystemSetting::getMonthlyBillingStartDate()` retorne `'2025-01-01'`
- Revisa la lógica híbrida en `WaterConnectionController::calculatePendingMonths()`

## Notas Técnicas

- Usa `Carbon` para generar fechas históricas realistas
- Los números de paja son únicos por comunidad
- Las fechas se generan con horas aleatorias para simular datos reales
- El 85% de las pajas legacy están activas (más realista)
