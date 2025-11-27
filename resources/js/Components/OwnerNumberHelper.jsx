/**
 * Componente helper que muestra sugerencias de números de propietario disponibles
 * basado en los números ya usados en una comunidad específica.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string} props.community - La comunidad seleccionada.
 * @param {string} props.currentValue - El valor actual del campo owner_number.
 * @param {string} [props.excludeId] - ID de la water connection a excluir (para edición).
 *
 * @returns {JSX.Element} Panel con sugerencias y números usados.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OwnerNumberHelper({ community, currentValue, excludeId = null }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!community) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('water-connections.owner-numbers-by-community'), {
                    params: { community }
                });
                setData(response.data);
            } catch (error) {
                console.error('Error fetching owner numbers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [community]);

    if (!community) {
        return (
            <div className="mt-2 rounded-md bg-yellow-50 p-3">
                <p className="text-sm text-yellow-700">
                    💡 Seleccione primero un propietario para ver los números disponibles en su comunidad.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mt-2 rounded-md bg-gray-50 p-3">
                <p className="text-sm text-gray-500">Cargando sugerencias...</p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const isCurrentValueUsed = data.used_numbers.includes(currentValue?.trim());
    const isCurrentValueSuggested = currentValue?.trim() === data.suggested_next;

    return (
        <div className="mt-2 space-y-2">
            {/* Sugerencia del siguiente número disponible */}
            <div className="rounded-md bg-blue-50 p-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                            💡 Número sugerido: <span className="text-lg font-bold">{data.suggested_next}</span>
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                            {data.total_count} número{data.total_count !== 1 ? 's' : ''} registrado{data.total_count !== 1 ? 's' : ''} en {community}
                        </p>
                    </div>
                    {data.last_numbers.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                            {isExpanded ? '▲ Ocultar' : '▼ Ver últimos'}
                        </button>
                    )}
                </div>
            </div>

            {/* Validación del valor actual */}
            {currentValue && currentValue.trim() !== '' && (
                <div>
                    {isCurrentValueUsed && !excludeId && (
                        <div className="rounded-md bg-red-50 p-3">
                            <p className="text-sm font-medium text-red-800">
                                ⚠️ Este número ya está en uso en {community}
                            </p>
                        </div>
                    )}
                    {!isCurrentValueUsed && currentValue.trim() !== data.suggested_next && (
                        <div className="rounded-md bg-green-50 p-3">
                            <p className="text-sm font-medium text-green-800">
                                ✓ Este número está disponible
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Lista expandible de últimos números registrados */}
            {isExpanded && data.last_numbers.length > 0 && (
                <div className="rounded-md border border-gray-200 bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-gray-700">
                        Últimos números registrados:
                    </p>
                    <div className="space-y-1">
                        {data.last_numbers.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-xs text-gray-600"
                            >
                                <span className="font-mono font-semibold text-gray-900">
                                    {item.owner_number}
                                </span>
                                <span className="text-gray-500">
                                    {item.owner_name} · {item.created_at}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
