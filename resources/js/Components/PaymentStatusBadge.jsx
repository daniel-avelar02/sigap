/**
 * Componente de insignia (badge) para mostrar el estado de pago de una paja de agua.
 *
 * Muestra los estados de pago con colores distintivos. Una conexión puede tener múltiples
 * estados de mora simultáneamente (excepto 'al_dia' que es exclusivo):
 * - Al día: Verde (exclusivo)
 * - En mora: Rojo (cuota mensual)
 * - Mora medidor: Naranja (plan de cuotas de medidor)
 * - Mora instalación: Amarillo (plan de cuotas de instalación)
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string|string[]} props.paymentStatus - El estado o estados de pago.
 * @param {string} [props.size='md'] - El tamaño del badge ('sm', 'md' o 'lg').
 *
 * @returns {JSX.Element} Los badges renderizados con los colores apropiados.
 *
 * @example
 * // Badge único
 * <PaymentStatusBadge paymentStatus={['al_dia']} />
 *
 * @example
 * // Múltiples badges
 * <PaymentStatusBadge paymentStatus={['en_mora', 'en_mora_medidor']} size="sm" />
 */

const PAYMENT_STATUS_COLORS = {
    'al_dia': 'bg-green-500',
    'en_mora': 'bg-red-500',
    'en_mora_medidor': 'bg-orange-500',
    'en_mora_instalacion': 'bg-yellow-500',
};

const PAYMENT_STATUS_LABELS = {
    'al_dia': 'Al día',
    'en_mora': 'En mora',
    'en_mora_medidor': 'Mora medidor',
    'en_mora_instalacion': 'Mora instalación',
};

export default function PaymentStatusBadge({ paymentStatus, size = 'md' }) {
    // Convertir a array si es string
    const statuses = Array.isArray(paymentStatus) ? paymentStatus : [paymentStatus];
    
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <div className="flex flex-wrap gap-1">
            {statuses.map((status, index) => {
                const colorClass = PAYMENT_STATUS_COLORS[status] || 'bg-gray-500';
                const label = PAYMENT_STATUS_LABELS[status] || status;
                
                return (
                    <span
                        key={index}
                        className={`inline-flex items-center rounded-full font-medium text-white ${colorClass} ${sizeClasses[size]}`}
                    >
                        {label}
                    </span>
                );
            })}
        </div>
    );
}
