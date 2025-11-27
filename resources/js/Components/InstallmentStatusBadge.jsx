export default function InstallmentStatusBadge({ status, size = 'md' }) {
    const STATUS_COLORS = {
        active: 'bg-blue-500',
        completed: 'bg-green-500',
        cancelled: 'bg-gray-500',
    };

    const STATUS_LABELS = {
        active: 'Activo',
        completed: 'Completado',
        cancelled: 'Cancelado',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    const color = STATUS_COLORS[status] || 'bg-gray-500';
    const label = STATUS_LABELS[status] || status;

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium text-white ${color} ${sizeClasses[size]}`}
        >
            {label}
        </span>
    );
}
