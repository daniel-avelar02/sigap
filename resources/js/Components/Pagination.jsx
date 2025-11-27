import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-1 items-center justify-between">
            <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    {links.map((link, index) => {
                        // Traducir las etiquetas de paginación
                        let label = link.label;
                        if (label === '&laquo; Previous') {
                            label = '&laquo; Anterior';
                        } else if (label === 'Next &raquo;') {
                            label = 'Siguiente &raquo;';
                        }
                        
                        return (
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
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
