import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cleanTaxId, formatTaxId } from '@/Utils/helpers';

/**
 * Componente de input para NIT (Número de Identificación Tributaria) de organizaciones.
 * Formatea automáticamente el NIT al formato: ####-######-###-#
 * Ejemplo: 0210-090676-001-4
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string} [props.type='text'] - El tipo del input (siempre 'text' para NIT).
 * @param {string} [props.className=''] - Clases CSS adicionales para el input.
 * @param {boolean} [props.isFocused=false] - Si el input debe tener foco al montarse.
 * @param {string} [props.value=''] - El valor actual del NIT.
 * @param {function} [props.onChange] - Función callback cuando cambia el valor.
 * @param {Object} ref - Referencia al elemento input.
 *
 * @returns {JSX.Element} El input de NIT formateado.
 *
 * @example
 * <TaxIdInput
 *     value={data.tax_id}
 *     onChange={(e) => setData('tax_id', e.target.value)}
 *     className="mt-1 block w-full"
 * />
 */
export default forwardRef(function TaxIdInput(
    { type = 'text', className = '', isFocused = false, value = '', onChange, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const handleChange = (e) => {
        let inputValue = e.target.value;
        
        // Limpiar el valor (solo números)
        const cleaned = cleanTaxId(inputValue);
        
        // Limitar a 14 dígitos
        if (cleaned.length > 14) {
            return;
        }
        
        // Formatear automáticamente mientras se escribe
        const formatted = formatTaxId(cleaned);
        
        // Crear evento sintético con el valor limpio (sin guiones) para almacenamiento
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: cleaned, // Guardar sin formato en la base de datos
            },
        };
        
        // Actualizar el input visual con formato
        e.target.value = formatted || '';
        
        // Llamar onChange con el valor limpio
        if (onChange) {
            onChange(syntheticEvent);
        }
    };

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                className
            }
            ref={localRef}
            value={formatTaxId(value) || ''}
            onChange={handleChange}
            placeholder="0210-090676-001-4"
            maxLength={17} // 14 dígitos + 3 guiones
        />
    );
});
