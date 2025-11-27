export default function InstallmentProgressBar({ percentage, installmentsPaid, installmentsTotal, showLabels = true }) {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    return (
        <div className="w-full">
            {showLabels && (
                <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                        {installmentsPaid} de {installmentsTotal} cuotas pagadas
                    </span>
                    <span className="font-semibold text-gray-900">{clampedPercentage.toFixed(1)}%</span>
                </div>
            )}
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                    className={`h-full transition-all duration-300 ${
                        clampedPercentage === 100
                            ? 'bg-green-500'
                            : clampedPercentage >= 75
                              ? 'bg-blue-500'
                              : clampedPercentage >= 50
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                    }`}
                    style={{ width: `${clampedPercentage}%` }}
                />
            </div>
        </div>
    );
}
