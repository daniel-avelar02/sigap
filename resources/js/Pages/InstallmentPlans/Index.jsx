import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Pagination from '@/Components/Pagination';
import CommunityBadge from '@/Components/CommunityBadge';
import InstallmentStatusBadge from '@/Components/InstallmentStatusBadge';
import InstallmentProgressBar from '@/Components/InstallmentProgressBar';

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Planes de Cuotas
                    </h2>
                    <Link
                        href={route('installment-plans.create', getCurrentFilters())}
                        className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700"
                    >
                        Nuevo Plan
                    </Link>
                </div>
            }
        >
            <Head title="Planes de Cuotas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filtros */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por código o nombre..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full rounded-md border-gray-300"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={community}
                                        onChange={(e) => { setCommunity(e.target.value); handleFilterChange({ community: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300"
                                    >
                                        <option value="">Todas las comunidades</option>
                                        {communities.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={planType}
                                        onChange={(e) => { setPlanType(e.target.value); handleFilterChange({ plan_type: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300"
                                    >
                                        <option value="">Todos los tipos</option>
                                        {Object.entries(planTypes).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={status}
                                        onChange={(e) => { setStatus(e.target.value); handleFilterChange({ status: e.target.value }); }}
                                        className="w-full rounded-md border-gray-300"
                                    >
                                        <option value="">Todos los estados</option>
                                        {Object.entries(statuses).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tabla */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Paja</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Propietario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Comunidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Progreso</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Saldo</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {plans.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                    No se encontraron planes de cuotas.
                                                </td>
                                            </tr>
                                        ) : (
                                            plans.data.map((plan) => (
                                                <tr key={plan.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        {plan.water_connection?.code}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {plan.water_connection?.owner?.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <CommunityBadge community={plan.water_connection?.community} size="sm" />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {planTypes[plan.plan_type]}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <InstallmentStatusBadge status={plan.status} size="sm" />
                                                    </td>
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
                                                    <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-orange-600">
                                                        ${parseFloat(plan.balance).toFixed(2)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                        <Link
                                                            href={route('installment-plans.show', [plan.id, getCurrentFilters()])}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Ver detalles
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {plans.data.length > 0 && <Pagination links={plans.links} />}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
