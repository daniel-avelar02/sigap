import { useState } from 'react';

export default function InstallmentSelector({
    pendingInstallments,
    suggestedAmount,
    balance,
    onSelectionChange,
}) {
    const [selectedInstallments, setSelectedInstallments] = useState([]);

    const handleToggleInstallment = (installment) => {
        const isSelected = selectedInstallments.some((s) => s.number === installment.number);

        let newSelection;
        if (isSelected) {
            newSelection = selectedInstallments.filter((s) => s.number !== installment.number);
        } else {
            newSelection = [...selectedInstallments, installment];
        }

        // Ordenar por número de cuota
        newSelection.sort((a, b) => a.number - b.number);

        setSelectedInstallments(newSelection);
        onSelectionChange(newSelection);
    };

    const totalSelected = selectedInstallments.reduce(
        (sum, inst) => sum + parseFloat(inst.suggested_amount),
        0
    );

    return (
        <div>
            <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                    Cuotas Pendientes ({pendingInstallments.length})
                </h3>
                
                {pendingInstallments.length === 0 ? (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                        No hay cuotas pendientes. El plan está completado.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingInstallments.map((installment) => {
                            const isSelected = selectedInstallments.some(
                                (s) => s.number === installment.number
                            );

                            return (
                                <label
                                    key={installment.number}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border-2 p-3 transition ${
                                        isSelected
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleInstallment(installment)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Cuota #{installment.number}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Monto sugerido: ${parseFloat(installment.suggested_amount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Resumen de selección */}
            {selectedInstallments.length > 0 && (
                <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            Cuotas seleccionadas:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                            {selectedInstallments.length}
                        </span>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total a pagar:</span>
                        <span className="text-lg font-bold text-indigo-600">
                            ${totalSelected.toFixed(2)}
                        </span>
                    </div>
                    <div className="text-xs text-gray-600">
                        Cuotas: {selectedInstallments.map((s) => `#${s.number}`).join(', ')}
                    </div>
                </div>
            )}

            {/* Información del saldo */}
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Saldo pendiente del plan:</span>
                    <span className="font-bold text-orange-600">
                        ${parseFloat(balance).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}
