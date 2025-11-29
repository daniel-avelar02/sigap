# Dashboard - Panel de Control SIGAP

## Descripción General

El Dashboard es el panel principal del Sistema Integral de Gestión de Agua Potable (SIGAP) que presenta una vista consolidada de todas las operaciones, métricas y estadísticas del sistema en tiempo real.

## Características Principales

### 1. KPIs (Indicadores Clave de Rendimiento)

El dashboard muestra 4 tarjetas principales con métricas esenciales:

#### **Propietarios**
- Total de propietarios registrados en el sistema
- Icono de usuarios múltiples
- Color: Índigo

#### **Pajas de Agua**
- Total de conexiones de agua registradas
- Desglose de conexiones activas vs suspendidas
- Icono de servidor/red
- Color: Azul

#### **Ingresos del Mes Actual**
- Total de ingresos acumulados en el mes corriente
- Suma de todos los tipos de pagos
- Formato de moneda USD
- Icono de dinero
- Color: Verde

#### **Estado de Pagos**
- Número de conexiones al día
- Número de conexiones en mora
- Barra de progreso visual que muestra el porcentaje de conexiones al día
- Icono de verificación
- Color: Naranja

### 2. Gráficos Interactivos

#### **Tendencia de Ingresos (6 meses)**
- **Tipo:** Gráfico de líneas con área rellena
- **Datos:** Ingresos totales de los últimos 6 meses
- **Características:**
  - Curva suavizada (tensión 0.4)
  - Área rellena con gradiente transparente
  - Tooltips interactivos con formato de moneda
  - Eje Y formateado en dólares
- **Propósito:** Visualizar la evolución temporal de los ingresos

#### **Ingresos por Tipo (Mes Actual)**
- **Tipo:** Gráfico de dona (Doughnut)
- **Categorías:**
  - Cuotas Mensuales (Índigo)
  - Otros Pagos (Verde)
  - Planes de Cuotas (Naranja)
  - Pagos Unificados (Azul)
- **Características:**
  - Colores distintivos por categoría
  - Leyenda en la parte inferior
  - Tooltips con valores en USD
- **Propósito:** Mostrar la distribución de ingresos por tipo de pago

#### **Pajas por Comunidad**
- **Tipo:** Gráfico de barras
- **Datos:** Número de conexiones de agua por cada comunidad
- **Características:**
  - Barras con bordes redondeados
  - Color azul consistente
  - Ordenado por cantidad (descendente)
- **Propósito:** Visualizar la distribución geográfica de las conexiones

#### **Top 5 Comunidades (Ingresos)**
- **Tipo:** Gráfico de barras horizontales/verticales
- **Datos:** Las 5 comunidades con mayores ingresos del mes
- **Características:**
  - Colores diferentes para cada comunidad
  - Barras con bordes redondeados
- **Propósito:** Identificar las comunidades más productivas

### 3. Estadísticas de Planes de Cuotas

Sección con 3 tarjetas estadísticas:

- **Planes Activos** (Azul)
  - Planes de cuotas en curso
- **Planes Completados** (Verde)
  - Planes finalizados exitosamente
- **Planes Cancelados** (Rojo)
  - Planes cancelados o anulados

### 4. Otros Pagos por Tipo

Lista detallada de otros pagos registrados en el mes actual:

- Reconexión
- Reparaciones
- Accesorios
- Traslados/Traspasos
- Prima de Instalación
- Multas
- Otros Conceptos

Cada tipo muestra:
- Nombre del tipo de pago
- Número de transacciones
- Monto total acumulado

### 5. Tabla de Pagos Recientes

Tabla interactiva con los últimos 10 pagos registrados en el sistema:

**Columnas:**
- Número de recibo
- Tipo de pago (con badge de color)
- Propietario
- Número de paja
- Comunidad
- Fecha de pago
- Monto

**Características:**
- Hover effect en filas
- Badges de colores según tipo de pago:
  - Cuota Mensual: Índigo
  - Otro Pago: Verde
  - Plan de Cuotas: Naranja
  - Pago Unificado: Gris
- Formato de moneda y fechas localizadas

## Tecnologías Utilizadas

### Backend
- **Laravel 11** con Inertia.js
- **DashboardController**: Controlador que procesa y prepara todos los datos
- **Eloquent ORM**: Para consultas optimizadas a la base de datos
- **Carbon**: Para manejo de fechas

### Frontend
- **React 18** con Inertia.js
- **Chart.js 4** con react-chartjs-2: Librería de gráficos
- **Tailwind CSS**: Estilos y diseño responsivo

### Componentes de Chart.js utilizados:
- CategoryScale
- LinearScale
- PointElement
- LineElement
- BarElement
- ArcElement
- Filler (para área rellena)
- Tooltip
- Legend

## Rendimiento y Optimización

### Consultas Optimizadas
- Uso de agregaciones SQL (SUM, COUNT)
- Queries con filtros de fecha eficientes
- Límites en consultas de datos recientes
- Carga eager de relaciones (with)

### Caching Potencial
El controlador está preparado para implementar caché de resultados:
```php
// Ejemplo de implementación futura
Cache::remember('dashboard_kpis', 300, function() {
    // Cálculo de KPIs
});
```

## Responsividad

El dashboard está completamente optimizado para diferentes tamaños de pantalla:

- **Desktop (lg):** Grid de 4 columnas para KPIs, 2 columnas para gráficos
- **Tablet (md):** Grid de 2 columnas para KPIs, 1-2 columnas para gráficos
- **Mobile (sm):** Stack vertical de todos los elementos

## Paleta de Colores

Colores principales utilizados (Tailwind):
- **Índigo-600**: `rgb(79, 70, 229)` - Color primario
- **Green-500**: `rgb(34, 197, 94)` - Éxito/Positivo
- **Orange-400**: `rgb(251, 146, 60)` - Advertencia
- **Red-500**: `rgb(239, 68, 68)` - Peligro/Negativo
- **Blue-500**: `rgb(59, 130, 246)` - Información
- **Purple-500**: `rgb(168, 85, 247)` - Destacado
- **Teal-500**: `rgb(20, 184, 166)` - Secundario
- **Pink-500**: `rgb(236, 72, 153)` - Acento

## Futuras Mejoras

### Corto Plazo
- [ ] Filtros de rango de fechas personalizado
- [ ] Exportación de datos a PDF/Excel
- [ ] Comparación de períodos (mes actual vs mes anterior)
- [ ] Notificaciones en tiempo real

### Mediano Plazo
- [ ] Gráficos de predicción de ingresos
- [ ] Mapa interactivo de comunidades
- [ ] Análisis de morosidad por comunidad
- [ ] Dashboard personalizable por usuario

### Largo Plazo
- [ ] Integración con Business Intelligence
- [ ] Reportes automáticos programados
- [ ] Panel de alertas automatizadas
- [ ] API pública para integración con otros sistemas

## Mantenimiento

### Actualización de Datos
Los datos se recalculan en cada carga del dashboard. Para mejorar el rendimiento en sistemas grandes, considerar:

1. Implementar caché de 5 minutos para KPIs
2. Precalcular estadísticas en trabajos programados
3. Usar vistas materializadas en la base de datos

### Monitoreo
Métricas a monitorear:
- Tiempo de carga del dashboard
- Queries más lentas
- Número de usuarios concurrentes
- Uso de memoria en el navegador

## Soporte

Para reportar problemas o sugerir mejoras al dashboard, contactar al equipo de desarrollo.

---

**Última actualización:** 28 de noviembre de 2025
**Versión:** 1.0.0
