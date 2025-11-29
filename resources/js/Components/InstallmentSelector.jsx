import { useState, useEffect } from 'react';

export default function InstallmentSelector({
    pendingInstallments = [],
    onSelectionChange,
    disabledInstallments = [],
    selectedInstallments: externalSelectedInstallments = null,
}) {
    const [selectedInstallments, setSelectedInstallments] = useState([]);
    
    // Asegurar que pendingInstallments sea un array
    const safeInstallments = Array.isArray(pendingInstallments) ? pendingInstallments : [];

    // Sincronizar con el estado externo si se proporciona
    useEffect(() => {
        if (externalSelectedInstallments !== null && JSON.stringify(externalSelectedInstallments) !== JSON.stringify(selectedInstallments)) {
            setSelectedInstallments(externalSelectedInstallments);
        }
    }, [externalSelectedInstallments]);

    const handleToggleInstallment = (installmentNumber) => {
        let newSelection;
        if (selectedInstallments.includes(installmentNumber)) {
            // Deseleccionar
            newSelection = selectedInstallments.filter((n) => n !== installmentNumber);
        } else {
            // SOLO PERMITIR 1 CUOTA A LA VEZ
            newSelection = [installmentNumber];
        }

        setSelectedInstallments(newSelection);
        if (onSelectionChange) {
            onSelectionChange(newSelection);
        }
    };

    const totalSelected = selectedInstallments.reduce((sum, num) => {
        const installment = safeInstallments.find(i => i.number === num);
        return sum + (installment ? parseFloat(installment.suggested_amount) : 0);
    }, 0);

    return (
        <div>
            <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Cuotas Pendientes ({safeInstallments.length})
                </h3>
                
                {safeInstallments.length === 0 ? (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                        No hay cuotas pendientes. El plan está completado.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 border border-indigo-200 rounded-lg bg-indigo-50">
                        {safeInstallments.map((installment) => {
                            const isSelected = selectedInstallments.includes(installment.number);
                            const isDisabled = disabledInstallments.includes(installment.number);

                            return (
                                <label
                                    key={installment.number}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-md transition-all ${
                                        isDisabled
                                            ? 'bg-gray-100 border border-gray-300 opacity-50 cursor-not-allowed'
                                            : isSelected
                                            ? 'bg-indigo-600 text-white shadow-md scale-105 cursor-pointer'
                                            : 'bg-white border border-indigo-300 hover:border-indigo-400 hover:shadow-sm cursor-pointer'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onChange={() => handleToggleInstallment(installment.number)}
                                        className="absolute top-2 right-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                    />
                                    <span className={`text-xs font-semibold text-center ${
                                        isSelected ? 'text-white' : 'text-indigo-900'
                                    }`}>
                                        Cuota #{installment.number}
                                    </span>
                                    <span className={`text-xs mt-1 ${
                                        isSelected ? 'text-indigo-100' : 'text-indigo-600'
                                    }`}>
                                        ${parseFloat(installment.suggested_amount).toFixed(2)}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Resumen de selección */}
            {selectedInstallments.length > 0 && (
                <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-indigo-700">
                            {selectedInstallments.length} {selectedInstallments.length === 1 ? 'cuota seleccionada' : 'cuotas seleccionadas'}
                        </p>
                        <div className="text-right">
                            <p className="text-xs text-indigo-600">Total:</p>
                            <p className="text-lg font-bold text-indigo-900">
                                ${totalSelected.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-indigo-600">
                        Cuotas: {selectedInstallments.map((n) => `#${n}`).join(', ')}
                    </div>
                </div>
            )}
        </div>
    );
}
