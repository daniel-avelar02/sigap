/**
 * Componente de búsqueda desplegable para propietarios.
 *
 * Este componente renderiza un campo de entrada de texto que permite buscar propietarios
 * por nombre o DUI. Realiza peticiones asíncronas a la ruta 'owners.search' con un
 * mecanismo de "debounce" para optimizar las llamadas. Muestra los resultados en una
 * lista desplegable e incluye manejo de estados de carga y cierre al hacer clic fuera.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {function(Object): void} props.onSelect - Función callback que se ejecuta cuando el usuario selecciona un propietario de la lista. Recibe el objeto del propietario seleccionado como argumento.
 * @param {string} [props.placeholder='Escriba nombre o DUI del propietario'] - Texto opcional para mostrar como marcador de posición (placeholder) en el input.
 * @returns {JSX.Element} El elemento JSX que contiene el input de búsqueda y el dropdown de resultados.
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TextInput from './TextInput';
import CommunityBadge from './CommunityBadge';
import { formatDui, formatPhone } from '@/Utils/helpers';

export default function OwnerSearchDropdown({ onSelect, placeholder = 'Escriba nombre o DUI del propietario' }) {
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
                const response = await axios.get(route('owners.search'), {
                    params: { query },
                });
                setResults(response.data);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error al buscar propietarios:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (owner) => {
        setQuery(`${owner.name} - ${owner.formatted_dui}`);
        setShowDropdown(false);
        onSelect(owner);
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
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg">
                    {results.map((owner) => (
                        <button
                            key={owner.id}
                            type="button"
                            onClick={() => handleSelect(owner)}
                            className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gray-100"
                        >
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                    {owner.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    DUI: {owner.formatted_dui} • Tel: {formatPhone(owner.phone)}
                                </div>
                            </div>
                            <div className="ml-3">
                                <CommunityBadge community={owner.community} size="sm" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && !loading && query.length >= 2 && results.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-3 shadow-lg">
                    <p className="text-sm text-gray-500">
                        No se encontraron propietarios con ese criterio de búsqueda.
                    </p>
                </div>
            )}
        </div>
    );
}
