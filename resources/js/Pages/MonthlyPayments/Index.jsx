import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function Index({ payments, pageTotal, filters, communities }) {
    const [search, setSearch] = useState(filters.search || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [year, setYear] = useState(filters.year || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const handleFilter = () => {
        router.get(route('monthly-payments.index'), {
            search,
            community,
            year,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setCommunity('');
        setYear('');
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
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
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
                            <div>
                                <InputLabel htmlFor="search" value="Búsqueda" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Recibo, paja, propietario..."
                                    className="mt-1 block w-full"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="community" value="Comunidad" />
                                <select
                                    id="community"
                                    value={community}
                                    onChange={(e) => setCommunity(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    {communities.map((comm) => (
                                        <option key={comm} value={comm}>{comm}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="year" value="Año" />
                                <select
                                    id="year"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="date_from" value="Desde" />
                                <TextInput
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="date_to" value="Hasta" />
                                <TextInput
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                            >
                                Filtrar
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Tabla de pagos */}
                    <div className="bg-white shadow sm:rounded-lg">
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
                                            N° Paja
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Propietario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Comunidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Mes / Año
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Monto
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {payments.data.length > 0 ? (
                                        payments.data.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                                    {payment.receipt_number}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {new Date(payment.payment_date).toLocaleDateString('es-SV')}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-blue-600">
                                                    #{payment.water_connection.owner_number}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {payment.water_connection.owner.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <CommunityBadge community={payment.water_connection.community} size="sm" />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {payment.months_paid && payment.months_paid.length > 1 ? (
                                                        <div className="flex flex-wrap gap-1">
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
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                    ${parseFloat(payment.total_amount).toFixed(2)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                    <Link
                                                        href={route('monthly-payments.show', payment.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Ver Comprobante
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
                                {payments.data.length > 0 && (
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="6" className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                                                Total en esta página:
                                            </td>
                                            <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                                                ${parseFloat(pageTotal).toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {payments.data.length > 0 && (
                            <div className="border-t border-gray-200 bg-white px-4 py-3">
                                <Pagination links={payments.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
