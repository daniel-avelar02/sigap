/**
 * Componente selector de mes y año para pagos mensuales.
 *
 * Proporciona dos selectores (mes y año) con validación para evitar
 * selección de períodos futuros y alertas visuales para meses pendientes.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {number} props.selectedMonth - Mes seleccionado (1-12).
 * @param {number} props.selectedYear - Año seleccionado.
 * @param {function(number): void} props.onMonthChange - Callback cuando cambia el mes.
 * @param {function(number): void} props.onYearChange - Callback cuando cambia el año.
 * @param {Array} [props.pendingMonths] - Array de meses pendientes para mostrar alertas.
 * @param {string} [props.error] - Mensaje de error para mostrar.
 * @returns {JSX.Element}
 */

import { useMemo } from 'react';
import InputLabel from './InputLabel';
import InputError from './InputError';

export default function MonthPicker({
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange,
    pendingMonths = [],
    error,
}) {
    const months = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' },
    ];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Generar lista de años (5 años hacia atrás hasta el año actual)
    const years = useMemo(() => {
        const yearsList = [];
        for (let y = currentYear; y >= currentYear - 5; y--) {
            yearsList.push(y);
        }
        return yearsList;
    }, [currentYear]);

    // Verificar si el período seleccionado está pendiente
    const isPending = useMemo(() => {
        if (!selectedMonth || !selectedYear || !pendingMonths.length) return false;
        
        return pendingMonths.some(
            pm => pm.month === selectedMonth && pm.year === selectedYear
        );
    }, [selectedMonth, selectedYear, pendingMonths]);

    // Verificar si un mes está deshabilitado (futuro)
    const isMonthDisabled = (month) => {
        if (!selectedYear) return false;
        if (selectedYear > currentYear) return true;
        if (selectedYear === currentYear && month > currentMonth) return true;
        return false;
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Selector de Mes */}
                <div>
                    <InputLabel htmlFor="payment_month" value="Mes de Pago" />
                    <select
                        id="payment_month"
                        value={selectedMonth || ''}
                        onChange={(e) => onMonthChange(parseInt(e.target.value))}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                            error ? 'border-red-500' : ''
                        }`}
                    >
                        <option value="">Seleccione un mes</option>
                        {months.map((month) => (
                            <option
                                key={month.value}
                                value={month.value}
                                disabled={isMonthDisabled(month.value)}
                            >
                                {month.label}
                                {isMonthDisabled(month.value) ? ' (Futuro)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selector de Año */}
                <div>
                    <InputLabel htmlFor="payment_year" value="Año" />
                    <select
                        id="payment_year"
                        value={selectedYear || ''}
                        onChange={(e) => onYearChange(parseInt(e.target.value))}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                            error ? 'border-red-500' : ''
                        }`}
                    >
                        <option value="">Seleccione un año</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mensaje de error */}
            {error && <InputError message={error} />}

            {/* Alerta de mes pendiente */}
            {isPending && !error && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-800">
                                Este mes está pendiente de pago
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
