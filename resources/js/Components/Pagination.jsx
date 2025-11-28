/**
 * Componente de paginación reutilizable para aplicaciones Inertia.js.
 *
 * Este componente renderiza una barra de navegación de paginación responsiva.
 * Muestra botones de "Anterior" y "Siguiente" en dispositivos móviles, y una
 * lista completa de páginas con información de resultados en pantallas de escritorio.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {Array<Object>} props.links - Array de objetos de enlace de paginación generados por Laravel/Inertia.
 * @param {string|null} props.links[].url - La URL del enlace (puede ser null si no está activo).
 * @param {string} props.links[].label - La etiqueta del enlace (ej. "1", "Next &raquo;").
 * @param {boolean} props.links[].active - Indica si es la página actual.
 * @param {number} [props.from] - El índice del primer resultado mostrado en la página actual.
 * @param {number} [props.to] - El índice del último resultado mostrado en la página actual.
 * @param {number} [props.total] - El número total de resultados en todas las páginas.
 *
 * @returns {JSX.Element|null} El elemento de paginación renderizado o null si no hay suficientes enlaces.
 *
 * @example
 * // Uso básico con datos de paginación de Laravel
 * <Pagination
 *    links={users.links}
 *    from={users.from}
 *    to={users.to}
 *    total={users.total}
 * />
 */

import { Link } from '@inertiajs/react';

export default function Pagination({ links, from, to, total }) {
    // No renderizar si no hay enlaces de paginación
    if (!links || links.length <= 3) {
        return null;
    }

    // Traducir las etiquetas de paginación
    const translateLabel = (label) => {
        if (label === '&laquo; Previous') {
            return '&laquo; Anterior';
        } else if (label === 'Next &raquo;') {
            return 'Siguiente &raquo;';
        }
        return label;
    };

    // Encontrar URLs de navegación
    const prevUrl = links.find(link => link.label === '&laquo; Previous')?.url;
    const nextUrl = links.find(link => link.label === 'Next &raquo;')?.url;

    return (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            {/* Vista móvil */}
            <div className="flex flex-1 justify-between sm:hidden">
                {prevUrl && (
                    <Link
                        href={prevUrl}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Anterior
                    </Link>
                )}
                {nextUrl && (
                    <Link
                        href={nextUrl}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Siguiente
                    </Link>
                )}
            </div>

            {/* Vista desktop */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                {from && to && total && (
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{from}</span> a{' '}
                            <span className="font-medium">{to}</span> de{' '}
                            <span className="font-medium">{total}</span> resultados
                        </p>
                    </div>
                )}
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                preserveState
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                    link.active
                                        ? 'z-10 bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''} ${
                                    index === 0 ? 'rounded-l-md' : ''
                                } ${
                                    index === links.length - 1 ? 'rounded-r-md' : ''
                                } border border-gray-300`}
                                dangerouslySetInnerHTML={{ __html: translateLabel(link.label) }}
                            />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
