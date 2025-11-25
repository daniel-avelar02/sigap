/**
 * Vista principal para la gestión y listado de propietarios.
 * 
 * Este componente renderiza una tabla con la lista de propietarios, permitiendo:
 * - Búsqueda en tiempo real (con debounce).
 * - Filtrado por comunidad y estado (activo/inactivo).
 * - Ordenamiento por columnas (nombre, comunidad).
 * - Paginación de resultados.
 * - Acciones CRUD: Ver detalles, Editar, Desactivar (Soft Delete) y Restaurar.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.owners - Objeto de paginación (Laravel LengthAwarePaginator) que contiene la lista de propietarios (`data`) y enlaces de paginación (`links`).
 * @param {Object} props.filters - Estado actual de los filtros recibidos desde el backend para mantener la persistencia entre recargas.
 * @param {string} [props.filters.search] - Término de búsqueda actual.
 * @param {string} [props.filters.community] - Comunidad seleccionada para filtrar.
 * @param {string} [props.filters.status] - Estado seleccionado ('all', 'active', 'inactive').
 * @param {string} [props.filters.sort_by] - Columna por la cual se está ordenando actualmente.
 * @param {string} [props.filters.sort_order] - Dirección del ordenamiento ('asc' o 'desc').
 * @param {string[]} props.communities - Array de nombres de comunidades disponibles para poblar el filtro de selección.
 * 
 * @returns {JSX.Element} La página renderizada con el layout autenticado, filtros y tabla de datos.
 */

import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import Dropdown from '@/Components/Dropdown';
import CommunityBadge from '@/Components/CommunityBadge';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatDui, formatPhone } from '@/Utils/helpers';

export default function Index({ owners, filters, communities }) {
    const [search, setSearch] = useState(filters.search || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [ownerToDelete, setOwnerToDelete] = useState(null);
    const debounceTimeout = useRef(null);

    // Función para obtener los parámetros de filtro actuales
    const getCurrentFilters = () => ({
        search: search.trim() === '' ? undefined : search,
        community: community === '' ? undefined : community,
        status: status === 'all' ? undefined : status,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const applyFilters = (newFilters) => {
        router.get(route('owners.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    // Efecto para aplicar el filtro de búsqueda con debounce
    useEffect(() => {
        // Limpiar el timeout anterior
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Configurar nuevo timeout
        debounceTimeout.current = setTimeout(() => {
            applyFilters({
                search: search.trim() === '' ? undefined : search,
                community: community === '' ? undefined : community,
                status: status === 'all' ? undefined : status,
            });
        }, 500); // 500ms de espera después de dejar de escribir

        // Cleanup
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [search]); // Solo se ejecuta cuando cambia 'search'

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
    };

    const handleCommunityChange = (e) => {
        const value = e.target.value;
        setCommunity(value);
        
        // Aplicar filtro inmediatamente
        applyFilters({
            search: search.trim() === '' ? undefined : search,
            community: value === '' ? undefined : value,
            status: status === 'all' ? undefined : status,
        });
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setStatus(value);
        
        // Aplicar filtro inmediatamente
        applyFilters({
            search: search.trim() === '' ? undefined : search,
            community: community === '' ? undefined : community,
            status: value === 'all' ? undefined : value,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCommunity('');
        setStatus('all');
        setSortBy('name');
        setSortOrder('asc');
        applyFilters({ sort_by: 'name', sort_order: 'asc' });
    };

    const handleSort = (column) => {
        let newSortOrder = 'asc';
        
        // Si ya estamos ordenando por esta columna, invertir el orden
        if (sortBy === column) {
            newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }
        
        setSortBy(column);
        setSortOrder(newSortOrder);
        
        applyFilters({
            search: search.trim() === '' ? undefined : search,
            community: community === '' ? undefined : community,
            status: status === 'all' ? undefined : status,
            sort_by: column,
            sort_order: newSortOrder,
        });
    };

    const handleDelete = (owner) => {
        setOwnerToDelete(owner);
        setConfirmingDelete(true);
    };

    const confirmDelete = () => {
        if (ownerToDelete) {
            router.delete(route('owners.destroy', ownerToDelete.id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmingDelete(false);
                    setOwnerToDelete(null);
                },
            });
        }
    };

    const handleRestore = (owner) => {
        router.post(route('owners.restore', owner.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Gestión de Propietarios
                    </h2>
                    <Link
                        href={route('owners.create', filters)}
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        Nuevo Propietario
                    </Link>
                </div>
            }
        >
            <Head title="Propietarios" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Buscar
                                    </label>
                                    <TextInput
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder="Nombre o DUI..."
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Comunidad
                                    </label>
                                    <select
                                        value={community}
                                        onChange={handleCommunityChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todas las comunidades</option>
                                        {communities.map((comm) => (
                                            <option key={comm} value={comm}>
                                                {comm}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Estado
                                    </label>
                                    <select
                                        value={status}
                                        onChange={handleStatusChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="active">Activos</option>
                                        <option value="inactive">Inactivos</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>Nombre</span>
                                                {sortBy === 'name' && (
                                                    <svg 
                                                        className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                        fill="currentColor" 
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            DUI
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Teléfono
                                        </th>
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                                            onClick={() => handleSort('community')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>Comunidad</span>
                                                {sortBy === 'community' && (
                                                    <svg 
                                                        className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                                        fill="currentColor" 
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {owners.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron propietarios.
                                            </td>
                                        </tr>
                                    ) : (
                                        owners.data.map((owner, index) => (
                                            <tr key={owner.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {owner.name}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {formatDui(owner.dui)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {formatPhone(owner.phone)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <CommunityBadge community={owner.community} size="sm" />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {owner.deleted_at ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                                            Inactivo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                            Activo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <span className="inline-flex rounded-md">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                                >
                                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content align="right" width="48" direction='up'>

                                                            {/* <Dropdown.Content
                                                                align={index >= owners.data.length - 3 ? "left" : "right"}
                                                                direction={index >= owners.data.length - 3 ? "up" : "down"}
                                                                width="48"
                                                            > */}

                                                                <Dropdown.Link 
                                                                    href={route('owners.show', [owner.id, filters])}
                                                                >
                                                                    Ver detalles
                                                                </Dropdown.Link>
                                                                {!owner.deleted_at && (
                                                                    <>
                                                                        <Dropdown.Link 
                                                                            href={route('owners.edit', [owner.id, filters])}
                                                                        >
                                                                            Editar
                                                                        </Dropdown.Link>
                                                                        <button
                                                                            onClick={() => handleDelete(owner)}
                                                                            className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                        >
                                                                            Desactivar
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {owner.deleted_at && (
                                                                    <button
                                                                        onClick={() => handleRestore(owner)}
                                                                        className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                    >
                                                                        Restaurar
                                                                    </button>
                                                                )}
                                                            </Dropdown.Content>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {owners.links.length > 3 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    {owners.prev_page_url && (
                                        <Link
                                            href={owners.prev_page_url}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Anterior
                                        </Link>
                                    )}
                                    {owners.next_page_url && (
                                        <Link
                                            href={owners.next_page_url}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Siguiente
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando <span className="font-medium">{owners.from}</span> a{' '}
                                            <span className="font-medium">{owners.to}</span> de{' '}
                                            <span className="font-medium">{owners.total}</span> resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                            {owners.links.map((link, index) => {
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
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${link.active
                                                                ? 'z-10 bg-indigo-600 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''} ${index === 0 ? 'rounded-l-md' : ''
                                                            } ${index === owners.links.length - 1 ? 'rounded-r-md' : ''} border border-gray-300`}
                                                        dangerouslySetInnerHTML={{ __html: label }}
                                                    />
                                                );
                                            })}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                show={confirmingDelete}
                title="Desactivar Propietario"
                message={`¿Está seguro de desactivar al propietario ${ownerToDelete?.name}? El propietario podrá ser restaurado posteriormente.`}
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                danger={true}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmingDelete(false);
                    setOwnerToDelete(null);
                }}
            />
        </AuthenticatedLayout>
    );
}
