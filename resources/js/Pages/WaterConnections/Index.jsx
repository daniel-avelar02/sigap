/**
 * Vista principal para la gestión y listado de pajas de agua.
 * 
 * Permite búsqueda, filtrado por propietario/comunidad/estados, ordenamiento,
 * paginación y acciones CRUD completas con soft delete.
 *
 * @param {Object} props.waterConnections - Paginador con lista de pajas de agua.
 * @param {Object} props.filters - Estado actual de filtros.
 * @param {string[]} props.communities - Comunidades disponibles.
 * @param {string[]} props.statuses - Estados operativos disponibles.
 * @param {string[]} props.paymentStatuses - Estados de pago disponibles.
 * @param {Object} props.paymentStatusLabels - Etiquetas en español para estados de pago.
 *
 * @returns {JSX.Element} La página con filtros y tabla de pajas de agua.
 */

import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import Dropdown from '@/Components/Dropdown';
import CommunityBadge from '@/Components/CommunityBadge';
import StatusBadge from '@/Components/StatusBadge';
import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import ConfirmModal from '@/Components/ConfirmModal';

export default function Index({ waterConnections, filters, communities, statuses, paymentStatuses, paymentStatusLabels }) {
    const [search, setSearch] = useState(filters.search || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || null);
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [waterConnectionToDelete, setWaterConnectionToDelete] = useState(null);
    const debounceTimeout = useRef(null);

    const getCurrentFilters = () => ({
        search: search.trim() === '' ? undefined : search,
        community: community === '' ? undefined : community,
        status: status === '' ? undefined : status,
        payment_status: paymentStatus === '' ? undefined : paymentStatus,
        sort_by: sortBy || undefined,
        sort_order: sortBy ? sortOrder : undefined,
    });

    const applyFilters = (newFilters) => {
        router.get(route('water-connections.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            applyFilters(getCurrentFilters());
        }, 500);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [search, community, status, paymentStatus]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleCommunityChange = (e) => {
        const value = e.target.value;
        setCommunity(value);
        applyFilters({
            ...getCurrentFilters(),
            community: value === '' ? undefined : value,
        });
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setStatus(value);
        applyFilters({
            ...getCurrentFilters(),
            status: value === '' ? undefined : value,
        });
    };

    const handlePaymentStatusChange = (e) => {
        const value = e.target.value;
        setPaymentStatus(value);
        applyFilters({
            ...getCurrentFilters(),
            payment_status: value === '' ? undefined : value,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCommunity('');
        setStatus('');
        setPaymentStatus('');
        setSortBy(null);
        setSortOrder('asc');
        router.get(route('water-connections.index'));
    };

    const handleSort = (column) => {
        let newSortOrder = 'asc';
        if (sortBy === column) {
            newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortOrder(newSortOrder);
        applyFilters({
            ...getCurrentFilters(),
            sort_by: column,
            sort_order: newSortOrder,
        });
    };

    const handleDelete = (waterConnection) => {
        setWaterConnectionToDelete(waterConnection);
        setConfirmingDelete(true);
    };

    const confirmDelete = () => {
        if (waterConnectionToDelete) {
            router.delete(route('water-connections.destroy', waterConnectionToDelete.id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmingDelete(false);
                    setWaterConnectionToDelete(null);
                },
            });
        }
    };

    const handleRestore = (waterConnection) => {
        router.post(route('water-connections.restore', waterConnection.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Gestión de Pajas de Agua
                    </h2>
                    <Link
                        href={route('water-connections.create', filters)}
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        Nueva Paja de Agua
                    </Link>
                </div>
            }
        >
            <Head title="Pajas de Agua" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Buscar
                                    </label>
                                    <TextInput
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder="Código, número, propietario..."
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
                                        <option value="">Todas</option>
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
                                        <option value="">Todos</option>
                                        <option value="active">Activos</option>
                                        <option value="inactive">Inactivos</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Estado de pago
                                    </label>
                                    <select
                                        value={paymentStatus}
                                        onChange={handlePaymentStatusChange}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Todos</option>
                                        {paymentStatuses.map((ps) => (
                                            <option key={ps} value={ps}>
                                                {paymentStatusLabels[ps]}
                                            </option>
                                        ))}
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
                                            onClick={() => handleSort('code')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>Código</span>
                                                {sortBy === 'code' && (
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
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                                            onClick={() => handleSort('owner_number')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>N° Propietario</span>
                                                {sortBy === 'owner_number' && (
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
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100 select-none"
                                            onClick={() => handleSort('owner_name')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>Propietario</span>
                                                {sortBy === 'owner_name' && (
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Pago
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {waterConnections.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No se encontraron pajas de agua.
                                            </td>
                                        </tr>
                                    ) : (
                                        waterConnections.data.map((wc) => (
                                            <tr key={wc.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-gray-900">
                                                        {wc.code}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    <div className="font-semibold text-gray-900">
                                                        {wc.owner_number || <span className="italic text-gray-400">N/A</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 whitespace-normal">
                                                        {wc.owner.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {wc.owner.formatted_dui}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <CommunityBadge community={wc.community} size="sm" />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {wc.deleted_at ? (
                                                        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                                            Inactivo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                            Activo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <PaymentStatusBadge paymentStatus={wc.payment_status} size="sm" />
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
                                                        <Dropdown.Content align="right" direction='up' width="48">
                                                            <Dropdown.Link 
                                                                href={route('water-connections.show', [wc.id, filters])}
                                                            >
                                                                Ver detalles
                                                            </Dropdown.Link>
                                                            {!wc.deleted_at && (
                                                                <>
                                                                    <Dropdown.Link 
                                                                        href={route('water-connections.edit', [wc.id, filters])}
                                                                    >
                                                                        Editar
                                                                    </Dropdown.Link>
                                                                    <button
                                                                        onClick={() => handleDelete(wc)}
                                                                        className="block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                    >
                                                                        Desactivar
                                                                    </button>
                                                                </>
                                                            )}
                                                            {wc.deleted_at && (
                                                                <button
                                                                    onClick={() => handleRestore(wc)}
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
                        {waterConnections.links.length > 3 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    {waterConnections.prev_page_url && (
                                        <Link
                                            href={waterConnections.prev_page_url}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Anterior
                                        </Link>
                                    )}
                                    {waterConnections.next_page_url && (
                                        <Link
                                            href={waterConnections.next_page_url}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Siguiente
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando <span className="font-medium">{waterConnections.from}</span> a{' '}
                                            <span className="font-medium">{waterConnections.to}</span> de{' '}
                                            <span className="font-medium">{waterConnections.total}</span> resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                            {waterConnections.links.map((link, index) => {
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
                                                            } ${index === waterConnections.links.length - 1 ? 'rounded-r-md' : ''} border border-gray-300`}
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
                title="Desactivar Paja de Agua"
                message={`¿Está seguro de desactivar la paja ${waterConnectionToDelete?.code}? Podrá ser restaurada posteriormente.`}
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                danger={true}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmingDelete(false);
                    setWaterConnectionToDelete(null);
                }}
            />
        </AuthenticatedLayout>
    );
}
