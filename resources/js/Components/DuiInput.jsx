/**
 * Componente de entrada personalizado para Documentos Únicos de Identidad (DUI).
 * 
 * Este componente envuelve un `TextInput` para manejar la entrada de números de DUI,
 * asegurando que solo se ingresen dígitos numéricos y limitando la longitud a 9 caracteres.
 * Muestra una vista previa del DUI formateado cuando se completa la longitud requerida.
 *
 * @component
 * @example
 * const [dui, setDui] = useState('');
 * return (
 *   <DuiInput
 *     value={dui}
 *     onChange={(e) => setDui(e.target.value)}
 *     className="w-full"
 *     placeholder="Ingrese su DUI"
 *   />
 * )
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string} [props.value=''] - El valor actual del input (sin formato, solo dígitos).
 * @param {string} [props.className=''] - Clases CSS adicionales para el input.
 * @param {function} [props.onChange] - Función callback que se ejecuta al cambiar el valor. Recibe un evento sintético con el valor limpio (solo números).
 * @param {Object} [props...rest] - Otras propiedades estándar pasadas al componente TextInput subyacente.
 * @param {React.Ref} ref - Referencia reenviada al elemento input subyacente.
 * 
 * @returns {JSX.Element} Un campo de entrada numérico con una vista previa del formato DUI.
 */
import { forwardRef, useState } from 'react';
import TextInput from './TextInput';
import { formatDui, cleanDui } from '@/Utils/helpers';

export default forwardRef(function DuiInput(
    { value = '', className = '', onChange, ...props },
    ref,
) {
    const [displayValue, setDisplayValue] = useState(value);

    const handleChange = (e) => {
        let inputValue = e.target.value;
        
        // Remover todo lo que no sea dígito
        inputValue = inputValue.replace(/\D/g, '');
        
        // Limitar a 9 dígitos
        if (inputValue.length > 9) {
            inputValue = inputValue.substring(0, 9);
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
                maxLength={9}
                value={displayValue}
                onChange={handleChange}
                className={className}
                placeholder="Ej: 012345678"
            />
            {displayValue && displayValue.length === 9 && (
                <p className="text-sm text-gray-600">
                    Formato: <span className="font-medium">{formatDui(displayValue)}</span>
                </p>
            )}
        </div>
    );
});
