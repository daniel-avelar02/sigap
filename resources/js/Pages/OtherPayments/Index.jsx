import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import { formatCurrency, formatDUI, formatDateTime } from '@/Utils/helpers';

export default function Index({ otherPayments, filters, paymentTypes, communities }) {
    const [search, setSearch] = useState(filters.search || '');
    const [paymentType, setPaymentType] = useState(filters.payment_type || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const debounceTimeout = useRef(null);

    const getCurrentFilters = () => ({
        search: search.trim() === '' ? undefined : search,
        payment_type: paymentType === '' ? undefined : paymentType,
        community: community === '' ? undefined : community,
        start_date: startDate === '' ? undefined : startDate,
        end_date: endDate === '' ? undefined : endDate,
    });

    const handleSearch = (value) => {
        setSearch(value);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            router.get(route('other-payments.index'), { ...getCurrentFilters(), search: value }, { preserveState: true });
        }, 300);
    };

    const handleFilterChange = (newFilters) => {
        router.get(route('other-payments.index'), { ...getCurrentFilters(), ...newFilters }, { preserveState: true });
    };

    const handleDelete = (id) => {
        if (confirm('¿Está seguro de eliminar este pago?')) {
            router.delete(route('other-payments.destroy', id), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleRestore = (id) => {
        if (confirm('¿Está seguro de restaurar este pago?')) {
            router.post(route('other-payments.restore', id), {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const getPaymentTypeBadgeColor = (type) => {
        const colors = {
            'reconexion': 'blue',
            'reparaciones': 'orange',
            'accesorios': 'green',
            'traslados_traspasos': 'purple',
            'prima_instalacion': 'yellow',
            'multas': 'red',
            'otros': 'gray',
        };
        return colors[type] || 'gray';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Otros Pagos
                    </h2>
                    <Link
                        href={route('other-payments.create', getCurrentFilters())}
                        className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700"
                    >
                        Registrar Pago
                    </Link>
                </div>
            }
        >
            <Head title="Otros Pagos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filtros */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por recibo, paja, nombre..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full rounded-md border-gray-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={paymentType}
                                        onChange={(e) => { setPaymentType(e.target.value); handleFilterChange({ payment_type: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">Todos los tipos</option>
                                        {Object.entries(paymentTypes).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={community}
                                        onChange={(e) => { setCommunity(e.target.value); handleFilterChange({ community: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="">Todas las comunidades</option>
                                        {Object.values(communities).map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        placeholder="Fecha inicio"
                                        value={startDate}
                                        onChange={(e) => { setStartDate(e.target.value); handleFilterChange({ start_date: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300 text-sm"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="date"
                                        placeholder="Fecha fin"
                                        value={endDate}
                                        onChange={(e) => { setEndDate(e.target.value); handleFilterChange({ end_date: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Tabla */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Recibo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Paja / Propietario
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Pagador
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Monto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {otherPayments.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No se encontraron pagos.
                                                </td>
                                            </tr>
                                        ) : (
                                            otherPayments.data.map((payment) => (
                                                <tr key={payment.id} className={payment.deleted_at ? 'bg-gray-50 opacity-60' : ''}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {payment.receipt_number}
                                                        {payment.deleted_at && (
                                                            <span className="ml-2 text-xs text-red-600">(Eliminado)</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {formatDateTime(payment.payment_date)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-${getPaymentTypeBadgeColor(payment.payment_type)}-100 text-${getPaymentTypeBadgeColor(payment.payment_type)}-800`}>
                                                            {paymentTypes[payment.payment_type]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div className="flex flex-col">
                                                            <div className="font-medium">
                                                                {payment.water_connection.code} - {payment.water_connection.owner_number}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {payment.water_connection.owner.name}
                                                            </div>
                                                            <div className="mt-1">
                                                                <CommunityBadge community={payment.water_connection.community} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div className="flex flex-col">
                                                            <div className="font-medium">{payment.payer_name}</div>
                                                            <div className="text-gray-500">{formatDUI(payment.payer_dui)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('other-payments.show', payment.id)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                Ver
                                                            </Link>
                                                            {payment.deleted_at ? (
                                                                <button
                                                                    onClick={() => handleRestore(payment.id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Restaurar
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleDelete(payment.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            <div className="mt-4">
                                <Pagination links={otherPayments.links} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
