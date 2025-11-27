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
    const [showFutureMonths, setShowFutureMonths] = useState(false);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Separar meses pendientes de futuros
    const pendingOnly = pendingMonths.filter(pm => pm.is_pending || pm.type === 'pending');
    const futureOnly = pendingMonths.filter(pm => pm.is_future || pm.type === 'future');

    // Actualizar cuando cambian los meses pendientes
    useEffect(() => {
        setSelectedMonths([]);
        setSelectAll(false);
        setShowFutureMonths(false);
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

            {/* Meses Pendientes (Atrasos) */}
            {pendingOnly.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                        <span className="text-sm font-medium text-red-800">
                            Meses Pendientes ({pendingOnly.length})
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 border border-red-200 rounded-lg bg-red-50">
                        {pendingOnly.map((pm, index) => {
                            const monthYear = `${pm.year}-${pm.month}`;
                            const isSelected = selectedMonths.includes(monthYear);
                            
                            return (
                                <label
                                    key={index}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-md cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white shadow-md scale-105'
                                            : 'bg-white border border-red-300 hover:border-red-400 hover:shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleMonth(monthYear)}
                                        className="absolute top-2 right-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className={`text-xs font-semibold text-center ${
                                        isSelected ? 'text-white' : 'text-red-900'
                                    }`}>
                                        {pm.period}
                                    </span>
                                    <span className={`text-xs mt-1 ${
                                        isSelected ? 'text-indigo-100' : 'text-red-600'
                                    }`}>
                                        ${parseFloat(monthlyFee).toFixed(2)}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Botón para mostrar/ocultar meses futuros */}
            {futureOnly.length > 0 && (
                <div>
                    <button
                        type="button"
                        onClick={() => setShowFutureMonths(!showFutureMonths)}
                        className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-300 rounded-lg px-4 py-2 transition-colors w-full justify-center"
                    >
                        <svg 
                            className={`w-4 h-4 transition-transform ${showFutureMonths ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>
                            {showFutureMonths ? 'Ocultar' : 'Mostrar'} pagos adelantados ({futureOnly.length} meses disponibles)
                        </span>
                    </button>

                    {/* Meses Futuros (Adelantos) */}
                    {showFutureMonths && (
                        <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                                <span className="text-sm font-medium text-green-800">
                                    Pagos Adelantados - Opcional
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-3 border border-green-200 rounded-lg bg-green-50">
                                {futureOnly.map((pm, index) => {
                                    const monthYear = `${pm.year}-${pm.month}`;
                                    const isSelected = selectedMonths.includes(monthYear);
                                    
                                    return (
                                        <label
                                            key={index}
                                            className={`relative flex flex-col items-center justify-center p-3 rounded-md cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                                                    : 'bg-white border border-green-300 hover:border-green-400 hover:shadow-sm'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleMonth(monthYear)}
                                                className="absolute top-2 right-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className={`text-xs font-semibold text-center ${
                                                isSelected ? 'text-white' : 'text-green-900'
                                            }`}>
                                                {pm.period}
                                            </span>
                                            <span className={`text-xs mt-1 ${
                                                isSelected ? 'text-indigo-100' : 'text-green-600'
                                            }`}>
                                                ${parseFloat(monthlyFee).toFixed(2)}
                                            </span>
                                            {!isSelected && (
                                                <span className="absolute top-1 left-1 text-[10px] bg-green-600 text-white px-1 rounded">
                                                    Adelanto
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
