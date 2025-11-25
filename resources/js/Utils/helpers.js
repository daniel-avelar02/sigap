/**
 * Formatea un DUI de 9 dígitos al formato ########-#
 * 
 * @param {string|null} dui - DUI de 9 dígitos
 * @returns {string|null} DUI formateado con guion
 */
export function formatDui(dui) {
    if (!dui || dui.length !== 9) {
        return dui;
    }

    return `${dui.substring(0, 8)}-${dui.substring(8, 9)}`;
}

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
