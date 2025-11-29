import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import InstallmentStatusBadge from '@/Components/InstallmentStatusBadge';
import InstallmentProgressBar from '@/Components/InstallmentProgressBar';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { formatDui } from '@/Utils/helpers';

export default function Index({ plans, filters, communities, planTypes, statuses, statusColors }) {
    const [search, setSearch] = useState(filters.search || '');
    const [community, setCommunity] = useState(filters.community || '');
    const [planType, setPlanType] = useState(filters.plan_type || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const debounceTimeout = useRef(null);

    const getCurrentFilters = () => ({
        search: search.trim() === '' ? undefined : search,
        community: community === '' ? undefined : community,
        plan_type: planType === '' ? undefined : planType,
        status: status === '' ? undefined : status,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    });

    const handleSearch = (value) => {
        setSearch(value);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            router.get(route('installment-plans.index'), { ...getCurrentFilters(), search: value }, { preserveState: true });
        }, 300);
    };

    const handleFilterChange = (newFilters) => {
        router.get(route('installment-plans.index'), { ...getCurrentFilters(), ...newFilters }, { preserveState: true });
    };

    const handleSort = (column) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);
        handleFilterChange({ sort_by: column, sort_order: newOrder });
    };

    const handleReset = () => {
        setSearch('');
        setCommunity('');
        setPlanType('');
        setStatus('');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get(route('installment-plans.index'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Planes de Cuotas
                    </h2>
                    <Link
                        href={route('installment-plans.create', getCurrentFilters())}
                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900"
                    >
                        Nuevo Plan
                    </Link>
                </div>
            }
        >
            <Head title="Planes de Cuotas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="mb-6 bg-white p-6 shadow sm:rounded-lg">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Filtro de búsqueda */}
                            <div>
                                <InputLabel htmlFor="search" value="Buscar" />
                                <TextInput
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Código o nombre..."
                                    className="mt-1 block w-full"
                                />
                            </div>
                            {/* Filtro por comunidad */}
                            <div>
                                <InputLabel htmlFor="community" value="Comunidad" />
                                <select
                                    id="community"
                                    value={community}
                                    onChange={(e) => { setCommunity(e.target.value); handleFilterChange({ community: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    {communities.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Filtro por tipo de plan */}
                            <div>
                                <InputLabel htmlFor="plan_type" value="Tipo de Plan" />
                                <select
                                    id="plan_type"
                                    value={planType}
                                    onChange={(e) => { setPlanType(e.target.value); handleFilterChange({ plan_type: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los tipos</option>
                                    {Object.entries(planTypes).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Filtro por estado */}
                            <div>
                                <InputLabel htmlFor="status" value="Estado" />
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); handleFilterChange({ status: e.target.value }); }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos los estados</option>
                                    {Object.entries(statuses).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Botón para limpiar filtros */}
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

                    {/* Tabla de planes de cuotas */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                {/* Encabezado de la tabla */}
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Paja de Agua</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Progreso</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Saldo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                                    </tr>
                                </thead>
                                {/* Cuerpo de la tabla */}
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {plans.data.length > 0 ? (
                                        plans.data.map((plan) => (
                                            <tr key={plan.id} className="hover:bg-gray-50">
                                                {/* Número y comunidad de paja de agua */}
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="flex flex-col">
                                                        <div className="font-medium"> #{plan.water_connection.owner_number}</div>
                                                        <div className="text-gray-500"><CommunityBadge community={plan.water_connection.community} size="sm" /></div>
                                                    </div>
                                                </td>
                                                {/* Nombre y DUI del propietario */}
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 whitespace-normal">
                                                        {plan.water_connection.owner.name}
                                                    </div>
                                                    {plan.water_connection.owner?.dui && (
                                                        <div className="text-xs text-gray-500">
                                                            {formatDui(plan.water_connection.owner.dui)}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Tipo de plan */}
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {planTypes[plan.plan_type]}
                                                </td>
                                                {/* Estado */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <InstallmentStatusBadge status={plan.status} size="sm" />
                                                </td>
                                                {/* Progreso */}
                                                <td className="px-6 py-4" style={{ minWidth: '200px' }}>
                                                    <InstallmentProgressBar
                                                        percentage={plan.progress_percentage}
                                                        installmentsPaid={plan.installments_paid_count}
                                                        installmentsTotal={plan.installment_count}
                                                        showLabels={false}
                                                    />
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {plan.installments_paid_count}/{plan.installment_count} cuotas
                                                    </div>
                                                </td>
                                                {/* Balance */}
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-orange-600">
                                                    ${parseFloat(plan.balance).toFixed(2)}
                                                </td>
                                                {/* Acciones */}
                                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                                                    <Link
                                                        href={route('installment-plans.show', [plan.id, getCurrentFilters()])}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Ver detalles
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                                                No se encontraron planes de cuotas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <Pagination
                            links={plans.links}
                            from={plans.from}
                            to={plans.to}
                            total={plans.total}
                        />
                    </div>{/* Final tabla de planes de cuotas */}
                </div>
            </div>
        </AuthenticatedLayout >
    );
}
