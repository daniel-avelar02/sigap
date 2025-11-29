import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { formatDui, formatCurrency } from '@/Utils/helpers';

export default function Index({ payments, filters, communities, paymentTypes, otherPaymentTypes }) {
    const [search, setSearch] = useState(filters.search || '');
    const [paymentType, setPaymentType] = useState(filters.payment_type || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const debounceTimeout = useRef(null);

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

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
            router.get(route('payment-history.index'), { ...getCurrentFilters(), search: value }, { 
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);
    };

    const handleFilterChange = (newFilters) => {
        router.get(route('payment-history.index'), { ...getCurrentFilters(), ...newFilters }, { 
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setPaymentType('');
        setCommunity('');
        setStartDate('');
        setEndDate('');
        router.get(route('payment-history.index'));
    };

    const getPaymentTypeBadge = (type, label) => {
        const badges = {
            'monthly': <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">{label}</span>,
            'other': <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-800">{label}</span>,
            'installment': <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800">{label}</span>,
        };
        return badges[type] || <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800">{label}</span>;
    };

    const getOtherPaymentTypeBadge = (type, label) => {
        const badges = {
            'reconexion': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800">{label}</span>,
            'reparaciones': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800">{label}</span>,
            'accesorios': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">{label}</span>,
            'traslados_traspasos': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800">{label}</span>,
            'prima_instalacion': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">{label}</span>,
            'multas': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">{label}</span>,
            'otros': <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800">{label}</span>,
        };
        return badges[type] || <span className="inline-flex self-start rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800">{label}</span>;
    };

    const renderPaymentDetails = (payment) => {
        if (payment.type === 'monthly') {
            // Pago mensual
            if (payment.details.months_paid && payment.details.months_paid.length > 1) {
                return (
                    <div className="grid grid-cols-3 gap-1">
                        {payment.details.months_paid.map((mp, idx) => (
                            <span
                                key={idx}
                                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                            >
                                {monthNames[mp.month - 1]}/{mp.year}
                            </span>
                        ))}
                    </div>
                );
            } else {
                return (
                    <span className="text-sm">
                        {monthNames[payment.details.month - 1]} {payment.details.year}
                    </span>
                );
            }
        } else if (payment.type === 'other') {
            // Otro pago
            return (
                <div className="flex flex-col">
                    {getOtherPaymentTypeBadge(payment.details.payment_type, payment.details.payment_type_label)}
                    {payment.details.description && (
                        <span className="text-xs text-gray-500 mt-1">{payment.details.description}</span>
                    )}
                </div>
            );
        } else if (payment.type === 'installment') {
            // Pago de cuota
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {payment.details.installments_paid} cuota{payment.details.installments_paid > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                        Plan #{payment.details.installment_plan_id}
                    </span>
                </div>
            );
        }
        return '-';
    };

    const getDetailRoute = (payment) => {
        if (payment.type === 'monthly') {
            return route('monthly-payments.show', payment.id);
        } else if (payment.type === 'other') {
            return route('other-payments.show', payment.id);
        } else if (payment.type === 'installment') {
            return route('installment-plans.payment-receipt', {
                installment_plan: payment.details.installment_plan_id,
                payment: payment.id
            });
        }
        return '#';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Historial de Cobros
                    </h2>
                </div>
            }
        >
            <Head title="Historial de Cobros" />

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
                                    placeholder="Recibo, paja, propietario..."
                                    className="mt-1 block w-full"
                                />
                            </div>
                            { /* Filtro por tipo de pago */}
                            <div>
                                <InputLabel htmlFor="payment_type" value="Tipo de Cobro" />
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
                                    <option value="">Todas</option>
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
                                    id="start_date"
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
                                    id="end_date"
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

                    {/* Tabla de pagos */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                {/* Encabezado de la tabla */}
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Recibo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Paja de Agua</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Detalles</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                {/* Cuerpo de la tabla */}
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {payments.data.length > 0 ? (
                                        payments.data.map((payment) => (
                                            <tr key={`${payment.type}-${payment.id}`} className={payment.deleted_at ? 'bg-gray-50 opacity-60' : ''}>
                                                {/* Tipo de pago */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    {getPaymentTypeBadge(payment.type, payment.type_label)}
                                                </td>
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
                                                        <div className="font-medium">#{payment.water_connection.owner_number}</div>
                                                        <div className="text-gray-500">
                                                            <CommunityBadge community={payment.water_connection.community} size="sm" />
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Nombre y DUI del propietario */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 whitespace-normal">
                                                        {payment.owner.name}
                                                    </div>
                                                    {payment.owner?.dui && (
                                                        <div className="text-xs text-gray-500">
                                                            {formatDui(payment.owner.dui)}
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Detalles del pago */}
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {renderPaymentDetails(payment)}
                                                </td>
                                                {/* Monto total */}
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                {/* Acciones */}
                                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                    <Link
                                                        href={getDetailRoute(payment)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Ver comprobante
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                                                No se encontraron pagos registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <Pagination
                            links={payments.links}
                            from={payments.from}
                            to={payments.to}
                            total={payments.total}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
