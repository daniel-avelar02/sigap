/**
 * Componente de entrada de teléfono personalizado.
 * 
 * Este componente renderiza un campo de texto (`TextInput`) optimizado para la entrada de números telefónicos.
 * Maneja internamente el estado del valor para asegurar que solo se ingresen dígitos y limita la longitud a 8 caracteres.
 * Muestra una vista previa del número formateado cuando se completan los 8 dígitos.
 *
 * @component
 * @example
 * const [telefono, setTelefono] = useState('');
 * 
 * return (
 *   <PhoneInput
 *     value={telefono}
 *     onChange={(e) => setTelefono(e.target.value)}
 *     className="w-full"
 *     required
 *   />
 * )
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} [props.value=''] - El valor actual del input (número de teléfono sin formato).
 * @param {string} [props.className=''] - Clases CSS adicionales para aplicar al input.
 * @param {function} [props.onChange] - Función callback que se ejecuta cuando el valor cambia. Recibe un evento sintético con el valor limpio (solo dígitos).
 * @param {Object} [props...rest] - Cualquier otra propiedad que acepte un elemento input estándar (e.g., disabled, required, id).
 * @param {React.Ref} ref - Referencia reenviada al elemento input subyacente.
 * 
 * @returns {JSX.Element} Un contenedor div con el input y un texto de ayuda opcional con el formato.
 */

import { forwardRef, useState } from 'react';
import TextInput from './TextInput';
import { formatPhone } from '@/Utils/helpers';

export default forwardRef(function PhoneInput(
    { value = '', className = '', onChange, ...props },
    ref,
) {
    const [displayValue, setDisplayValue] = useState(value);

    const handleChange = (e) => {
        let inputValue = e.target.value;
        
        // Remover todo lo que no sea dígito
        inputValue = inputValue.replace(/\D/g, '');
        
        // Limitar a 8 dígitos
        if (inputValue.length > 8) {
            inputValue = inputValue.substring(0, 8);
        }
        
        setDisplayValue(inputValue);
        
        // Pasar el valor sin formato al onChange
        if (onChange) {
            onChange({
                ...e,
                target: {
                    ...e.target,
                    value: inputValue,
                },
            });
        }
    };

    return (
        <div className="space-y-1">
            <TextInput
                {...props}
                ref={ref}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={displayValue}
                onChange={handleChange}
                className={className}
                placeholder="Ej: 72345678"
            />
            {displayValue && displayValue.length === 8 && (
                <p className="text-sm text-gray-600">
                    Formato: <span className="font-medium">{formatPhone(displayValue)}</span>
                </p>
            )}
        </div>
    );
});
