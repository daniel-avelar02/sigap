/**
 * Componente de insignia (badge) para mostrar el estado operativo de una paja de agua.
 *
 * Muestra el estado con colores distintivos para facilitar su identificación visual:
 * - Activa: Verde
 * - Suspendida: Rojo
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.status - El estado operativo ('activa' o 'suspendida').
 * @param {string} [props.size='md'] - El tamaño del badge ('sm', 'md' o 'lg').
 *
 * @returns {JSX.Element} El badge renderizado con el color y tamaño apropiados.
 *
 * @example
 * // Badge de tamaño mediano
 * <StatusBadge status="activa" />
 *
 * @example
 * // Badge pequeño
 * <StatusBadge status="suspendida" size="sm" />
 */

const STATUS_COLORS = {
    'activa': 'bg-green-500',
    'suspendida': 'bg-red-500',
};

const STATUS_LABELS = {
    'activa': 'Activa',
    'suspendida': 'Suspendida',
};

export default function StatusBadge({ status, size = 'md' }) {
    const colorClass = STATUS_COLORS[status] || 'bg-gray-500';
    const label = STATUS_LABELS[status] || status;
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium text-white ${colorClass} ${sizeClasses[size]}`}
        >
            {label}
        </span>
    );
}
