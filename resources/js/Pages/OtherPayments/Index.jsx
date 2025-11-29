import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import { formatCurrency, formatDUI, formatDateTime } from '@/Utils/helpers';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

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

    const handleReset = () => {
        setSearch('');
        setPaymentType('');
        setCommunity('');
        setStartDate('');
        setEndDate('');
        router.get(route('other-payments.index'));
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
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        Registrar Pago
                    </Link>
                </div>
            }
        >
            <Head title="Otros Pagos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="mb-6 bg-white p-6 shadow sm:rounded-lg">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                            { /* Filtro por búsqueda */}
                            <div>
                                <InputLabel htmlFor="search" value="Buscar" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Buscar por recibo, paja, nombre..."
                                    className="mt-1 block w-full"
                                />
                            </div>
                            { /* Filtro por tipo de pago */}
                            <div>
                                <InputLabel htmlFor="payment_type" value="Tipo de Pago" />
                                <select
                                    id="payment_type"
                                    value={paymentType}
                                    onChange={(e) => { setPaymentType(e.target.value); handleFilterChange({ payment_type: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los tipos</option>
                                    {Object.entries(paymentTypes).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            { /* Filtro por comunidad */}
                            <div>
                                <InputLabel htmlFor="community" value="Comunidad" />
                                <select
                                    id="community"
                                    value={community}
                                    onChange={(e) => { setCommunity(e.target.value); handleFilterChange({ community: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas las comunidades</option>
                                    {Object.values(communities).map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            { /* Filtro por fecha desde */}
                            <div>
                                <InputLabel htmlFor="start_date" value="Desde" />
                                <input
                                    type="date"
                                    placeholder="Fecha inicio"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); handleFilterChange({ start_date: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            { /* Filtro por fecha hasta */}
                            <div>
                                <InputLabel htmlFor="end_date" value="Hasta" />
                                <input
                                    type="date"
                                    placeholder="Fecha fin"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); handleFilterChange({ end_date: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            { /* Botón de limpiar filtros */}
                            <div className="flex items-end">
                                <button
                                    onClick={handleReset}
                                    className="w-full rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Tabla de otros pagos */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                {/* Encabezado de la tabla */}
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Recibo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Paja de Agua</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                {/* Cuerpo de la tabla */}
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {otherPayments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                                                No se encontraron pagos.
                                            </td>
                                        </tr>
                                    ) : (
                                        otherPayments.data.map((payment) => (
                                            <tr key={payment.id} className={payment.deleted_at ? 'bg-gray-50 opacity-60' : ''}>
                                                {/* Numero de recibo */}
                                                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                    {payment.receipt_number}
                                                    {payment.deleted_at && (
                                                        <span className="ml-2 text-xs text-red-600">(Eliminado)</span>
                                                    )}
                                                </td>
                                                {/* Fecha de pago */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Date(payment.payment_date).toLocaleDateString('es-SV')}
                                                </td>
                                                {/* Número y comunidad de paja de agua */}
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="flex flex-col">
                                                        <div className="font-medium"> #{payment.water_connection.owner_number}</div>
                                                        <div className="text-gray-500"><CommunityBadge community={payment.water_connection.community} size="sm" /></div>
                                                    </div>
                                                </td>
                                                {/* Propietario */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 whitespace-normal">
                                                        <div className="font-medium">
                                                            {payment.water_connection.owner.name}
                                                        </div>
                                                        {payment.water_connection.owner?.community && (
                                                            <div className="text-gray-500">
                                                                {formatDUI(payment.water_connection.owner.dui)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Tipo de pago */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-${getPaymentTypeBadgeColor(payment.payment_type)}-100 text-${getPaymentTypeBadgeColor(payment.payment_type)}-800`}>
                                                        {paymentTypes[payment.payment_type]}
                                                    </span>
                                                </td>
                                                {/* Monto pagado */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                {/* Acciones */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('other-payments.show', payment.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Ver comprobante
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <Pagination
                            links={otherPayments.links}
                            from={otherPayments.from}
                            to={otherPayments.to}
                            total={otherPayments.total}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
