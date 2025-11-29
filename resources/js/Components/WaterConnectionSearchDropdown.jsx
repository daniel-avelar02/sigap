/**
 * Componente de búsqueda desplegable para pajas de agua (punto de cobro).
 *
 * Este componente permite buscar pajas de agua por código, número de propietario,
 * nombre del propietario o DUI. Retorna información completa de la paja incluyendo
 * propietario, pagos recientes y meses pendientes.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {function(Object): void} props.onSelect - Función callback ejecutada al seleccionar una paja.
 * @param {string} [props.placeholder] - Texto del marcador de posición.
 * @returns {JSX.Element}
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TextInput from './TextInput';
import CommunityBadge from './CommunityBadge';

export default function WaterConnectionSearchDropdown({ 
    onSelect, 
    placeholder = 'Buscar por código, número de paja, nombre o DUI del propietario' 
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Búsqueda con debounce
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('water-connections.search-payment'), {
                    params: { query },
                });
                setResults(response.data);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error al buscar pajas de agua:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (waterConnection) => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        onSelect(waterConnection);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <TextInput
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full"
            />

            {loading && (
                <div className="absolute right-3 top-3">
                    <svg
                        className="h-5 w-5 animate-spin text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            )}

            {showDropdown && results.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg">
                    {results.map((wc) => (
                        <button
                            key={wc.id}
                            type="button"
                            onClick={() => handleSelect(wc)}
                            className="flex w-full items-start justify-between px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-blue-600">
                                        #{wc.owner_number}
                                    </span>
                                    <CommunityBadge community={wc.community} size="sm" />
                                </div>
                                <div className="font-medium text-gray-900 truncate">
                                    {wc.owner.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {wc.owner.formatted_dui}
                                </div>
                                {/* {wc.has_pending_months && (
                                    <div className="mt-1 text-xs text-red-600 font-medium">
                                        ⚠ {wc.pending_months.filter(m => m.is_pending).length} {wc.pending_months.filter(m => m.is_pending).length === 1 ? 'mes pendiente' : 'meses pendientes'}
                                    </div>
                                )} */}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white py-4 text-center text-gray-500 shadow-lg">
                    No se encontraron pajas de agua
                </div>
            )}
        </div>
    );
}
