import { useState, useEffect } from 'react';
import InputLabel from './InputLabel';
import InputError from './InputError';

export default function MultiMonthSelector({ 
    pendingMonths = [], 
    onSelectionChange, 
    monthlyFee,
    error 
}) {
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Actualizar cuando cambian los meses pendientes
    useEffect(() => {
        setSelectedMonths([]);
        setSelectAll(false);
    }, [pendingMonths]);

    // Notificar cambios al padre
    useEffect(() => {
        onSelectionChange(selectedMonths);
    }, [selectedMonths]);

    const handleToggleMonth = (monthYear) => {
        setSelectedMonths(prev => {
            if (prev.includes(monthYear)) {
                return prev.filter(m => m !== monthYear);
            } else {
                return [...prev, monthYear].sort((a, b) => {
                    const [yearA, monthA] = a.split('-').map(Number);
                    const [yearB, monthB] = b.split('-').map(Number);
                    return yearA === yearB ? monthA - monthB : yearA - yearB;
                });
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedMonths([]);
        } else {
            const allMonths = pendingMonths.map(pm => `${pm.year}-${pm.month}`);
            setSelectedMonths(allMonths);
        }
        setSelectAll(!selectAll);
    };

    const totalAmount = selectedMonths.length * monthlyFee;

    if (pendingMonths.length === 0) {
        return (
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                            No hay meses pendientes
                        </h3>
                        <p className="mt-1 text-sm text-green-700">
                            Esta paja de agua está al día con sus pagos mensuales.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <InputLabel value="Seleccione los meses a pagar" />
                <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                    {selectAll ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {pendingMonths.map((pm, index) => {
                    const monthYear = `${pm.year}-${pm.month}`;
                    const isSelected = selectedMonths.includes(monthYear);
                    
                    return (
                        <label
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                                isSelected
                                    ? 'bg-indigo-100 border-2 border-indigo-500'
                                    : 'bg-white border border-gray-300 hover:border-indigo-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleMonth(monthYear)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className={`ml-3 text-sm font-medium ${
                                    isSelected ? 'text-indigo-900' : 'text-gray-700'
                                }`}>
                                    {pm.period}
                                </span>
                            </div>
                            <span className={`text-sm ${
                                isSelected ? 'text-indigo-700 font-semibold' : 'text-gray-500'
                            }`}>
                                ${parseFloat(monthlyFee).toFixed(2)}
                            </span>
                        </label>
                    );
                })}
            </div>

            {selectedMonths.length > 0 && (
                <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-indigo-700">
                                {selectedMonths.length} {selectedMonths.length === 1 ? 'mes seleccionado' : 'meses seleccionados'}
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                                Se generará un recibo por cada mes
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-indigo-700">Total a pagar:</p>
                            <p className="text-2xl font-bold text-indigo-900">
                                ${totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && <InputError message={error} />}
        </div>
    );
}
