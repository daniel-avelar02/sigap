import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { formatDui } from '@/Utils/helpers';

export default function Index({ payments, pageTotal, filters, communities }) {
    const [search, setSearch] = useState(filters.search || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const debounceTimeout = useRef(null);

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const getCurrentFilters = () => ({
        search: search.trim() === '' ? undefined : search,
        community: community === '' ? undefined : community,
        date_from: dateFrom === '' ? undefined : dateFrom,
        date_to: dateTo === '' ? undefined : dateTo,
    });

    const applyFilters = (newFilters) => {
        router.get(route('monthly-payments.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Efecto para aplicar el filtro de búsqueda con debounce
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
    }, [search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleCommunityChange = (e) => {
        setCommunity(e.target.value);
        applyFilters({
            ...getCurrentFilters(),
            community: e.target.value === '' ? undefined : e.target.value,
        });
    };

    const handleDateFromChange = (e) => {
        setDateFrom(e.target.value);
        applyFilters({
            ...getCurrentFilters(),
            date_from: e.target.value === '' ? undefined : e.target.value,
        });
    };

    const handleDateToChange = (e) => {
        setDateTo(e.target.value);
        applyFilters({
            ...getCurrentFilters(),
            date_to: e.target.value === '' ? undefined : e.target.value,
        });
    };

    const handleReset = () => {
        setSearch('');
        setCommunity('');
        setDateFrom('');
        setDateTo('');
        router.get(route('monthly-payments.index'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Historial de Pagos Mensuales
                    </h2>
                    <Link
                        href={route('monthly-payments.create')}
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        Nuevo Pago
                    </Link>
                </div>
            }
        >
            <Head title="Historial de Pagos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="mb-6 bg-white p-6 shadow sm:rounded-lg">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            { /* Filtro por búsqueda */}
                            <div>
                                <InputLabel htmlFor="search" value="Buscar" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={handleSearchChange}
                                    placeholder="Recibo, paja, propietario..."
                                    className="mt-1 block w-full"
                                />
                            </div>
                            { /* Filtro por comunidad */}
                            <div>
                                <InputLabel htmlFor="community" value="Comunidad" />
                                <select
                                    id="community"
                                    value={community}
                                    onChange={handleCommunityChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    {communities.map((comm) => (
                                        <option key={comm} value={comm}>{comm}</option>
                                    ))}
                                </select>
                            </div>
                            { /* Filtro por fecha desde */}
                            <div>
                                <InputLabel htmlFor="date_from" value="Desde" />
                                <TextInput
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={handleDateFromChange}
                                    className="mt-1 block w-full"
                                />
                            </div>
                            { /* Filtro por fecha hasta */}
                            <div>
                                <InputLabel htmlFor="date_to" value="Hasta" />
                                <TextInput
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={handleDateToChange}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Recibo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Paja de Agua</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mes / Año</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                {/* Cuerpo de la tabla */}
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {payments.data.length > 0 ? (
                                        payments.data.map((payment) => (
                                            <tr key={payment.id} className={payment.deleted_at ? 'bg-gray-50 opacity-60' : ''}>
                                                {/* Numero de recibo */}
                                                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                    {payment.receipt_number}
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
                                                {/* Nombre y DUI del propietario */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 whitespace-normal">
                                                        {payment.water_connection.owner.name}
                                                    </div>
                                                    {payment.water_connection.owner?.dui && (
                                                        <div className="text-xs text-gray-500">
                                                            {formatDui(payment.water_connection.owner.dui)}
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Meses pagados */}
                                                <td className="px-1 py-2 text-sm text-gray-900">
                                                    {payment.months_paid && payment.months_paid.length > 1 ? (
                                                        <div className="grid grid-cols-3 gap-1">
                                                            {payment.months_paid.map((mp, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded"
                                                                >
                                                                    {monthNames[mp.month - 1]}/{mp.year}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span>{monthNames[payment.payment_month - 1]} {payment.payment_year}</span>
                                                    )}
                                                </td>
                                                {/* Monto total */}
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                    ${parseFloat(payment.total_amount).toFixed(2)}
                                                </td>
                                                {/* Acciones */}
                                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                    <Link
                                                        href={route('monthly-payments.show', payment.id)}
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
                    </div>{/* Final tabla de pagos */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
