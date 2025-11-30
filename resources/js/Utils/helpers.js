/**
 * Formatea un DUI de 9 dígitos al formato ########-#
 * 
 * @param {string|null} dui - DUI de 9 dígitos
 * @returns {string|null} DUI formateado con guion
 */
export function formatDui(dui) {
    if (!dui) return dui;
    
    // Limpiar guiones existentes
    const clean = dui.replace(/-/g, '');
    
    if (clean.length !== 9) {
        return dui;
    }

    return `${clean.substring(0, 8)}-${clean.substring(8, 9)}`;
}

// Alias para compatibilidad
export const formatDUI = formatDui;

/**
 * Limpia el DUI removiendo guiones y espacios
 * 
 * @param {string} dui - DUI con o sin formato
 * @returns {string} DUI sin formato (solo dígitos)
 */
export function cleanDui(dui) {
    if (!dui) return '';
    return dui.replace(/[-\s]/g, '');
}

/**
 * Formatea un NIT (Número de Identificación Tributaria) al formato ####-######-###-#
 * 
 * @param {string|null} taxId - NIT de 14 dígitos
 * @returns {string|null} NIT formateado con guiones
 */
export function formatTaxId(taxId) {
    if (!taxId) return taxId;
    
    // Limpiar guiones existentes
    const clean = taxId.replace(/-/g, '');
    
    if (clean.length !== 14) {
        return taxId;
    }

    // Formato: 0210-090676-001-4
    return `${clean.substring(0, 4)}-${clean.substring(4, 10)}-${clean.substring(10, 13)}-${clean.substring(13, 14)}`;
}

/**
 * Limpia el NIT removiendo guiones y espacios
 * 
 * @param {string} taxId - NIT con o sin formato
 * @returns {string} NIT sin formato (solo dígitos)
 */
export function cleanTaxId(taxId) {
    if (!taxId) return '';
    return taxId.replace(/[-\s]/g, '');
}

/**
 * Formatea un teléfono de 8 dígitos al formato ####-####
 * 
 * @param {string|null} phone - Teléfono de 8 dígitos
 * @returns {string|null} Teléfono formateado con guion
 */
export function formatPhone(phone) {
    if (!phone || phone.length !== 8) {
        return phone;
    }

    return `${phone.substring(0, 4)}-${phone.substring(4, 8)}`;
}

/**
 * Limpia el teléfono removiendo guiones y espacios
 * 
 * @param {string} phone - Teléfono con o sin formato
 * @returns {string} Teléfono sin formato (solo dígitos)
 */
export function cleanPhone(phone) {
    if (!phone) return '';
    return phone.replace(/[-\s]/g, '');
}

/**
 * Formatea un monto a formato de moneda ($0.00)
 * 
 * @param {number|string} amount - Monto a formatear
 * @returns {string} Monto formateado con símbolo de dólar
 */
export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
}

/**
 * Formatea una fecha y hora
 * 
 * @param {string} dateTime - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export function formatDateTime(dateTime) {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    
    if (isNaN(date.getTime())) return dateTime;
    
    return new Intl.DateTimeFormat('es-SV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date);
}

/**
 * Formatea solo la fecha (sin hora)
 * 
 * @param {string} date - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return date;
    
    return new Intl.DateTimeFormat('es-SV', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(d);
}
