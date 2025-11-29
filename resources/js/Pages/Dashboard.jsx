import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const { 
        kpis = {}, 
        incomeByType = [], 
        incomesTrend = [], 
        connectionsByCommunity = [], 
        topCommunities = [], 
        otherPaymentsByType = [], 
        recentPayments = [],
        installationPlans = {},
        meterPlans = {}
    } = usePage().props;

    // Colores consistentes para el tema
    const colors = {
        primary: 'rgb(79, 70, 229)', // Indigo-600
        success: 'rgb(34, 197, 94)', // Green-500
        warning: 'rgb(251, 146, 60)', // Orange-400
        danger: 'rgb(239, 68, 68)', // Red-500
        info: 'rgb(59, 130, 246)', // Blue-500
        purple: 'rgb(168, 85, 247)', // Purple-500
        teal: 'rgb(20, 184, 166)', // Teal-500
        pink: 'rgb(236, 72, 153)', // Pink-500
    };

    // Configuración del gráfico de tendencia de ingresos
    const incomesTrendData = {
        labels: incomesTrend.map(item => item.month),
        datasets: [
            {
                label: 'Total',
                data: incomesTrend.map(item => item.total),
                borderColor: colors.primary,
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const incomesTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return '$' + context.parsed.y.toFixed(2);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value;
                    }
                }
            }
        }
    };

    // Gráfico de ingresos por tipo
    const incomeByTypeData = {
        labels: incomeByType.map(item => item.type),
        datasets: [{
            data: incomeByType.map(item => item.amount),
            backgroundColor: [
                colors.primary,
                colors.success,
                colors.warning,
                colors.info,
            ],
            borderWidth: 2,
            borderColor: '#fff',
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = '$' + context.parsed.toFixed(2);
                        return label + ': ' + value;
                    }
                }
            }
        },
    };

    // Gráfico de conexiones por comunidad
    const connectionsByCommunityData = {
        labels: connectionsByCommunity.map(item => item.community),
        datasets: [{
            label: 'Pajas de Agua',
            data: connectionsByCommunity.map(item => item.total),
            backgroundColor: colors.info,
            borderRadius: 6,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    maxTicksLimit: 10,
                }
            }
        }
    };

    // Gráfico de top comunidades por ingresos
    const topCommunitiesData = {
        labels: topCommunities.map(item => item.community),
        datasets: [{
            label: 'Ingresos',
            data: topCommunities.map(item => item.amount),
            backgroundColor: [
                colors.primary,
                colors.success,
                colors.warning,
                colors.info,
                colors.purple,
            ],
            borderRadius: 6,
        }],
    };

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-SV', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-SV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Panel de Control
                </h2>
            }
        >
            <Head title="Panel" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* KPIs Principales */}
                    <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total de Propietarios */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">Propietarios</dt>
                                            <dd className="text-3xl font-semibold text-gray-900">{kpis.totalOwners}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total de Conexiones */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">Pajas de Agua</dt>
                                            <dd className="text-3xl font-semibold text-gray-900">{kpis.totalConnections}</dd>
                                            <dd className="text-xs text-gray-500 mt-1">
                                                {kpis.activeConnections} activas / {kpis.suspendedConnections} suspendidas
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ingresos del Mes */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">Ingresos (Mes Actual)</dt>
                                            <dd className="text-3xl font-semibold text-gray-900">{formatCurrency(kpis.totalMonthIncome)}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estado de Pagos */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">Estado de Pagos</dt>
                                            <dd className="text-sm font-medium text-gray-900 mt-1">
                                                <span className="text-green-600">{kpis.connectionsUpToDate || 0} al día</span>
                                                <span className="mx-2">•</span>
                                                <span className="text-red-600">{kpis.connectionsInArrears || 0} en mora</span>
                                            </dd>
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-600 h-2 rounded-full" 
                                                    style={{ width: `${kpis.totalConnections > 0 ? ((kpis.connectionsUpToDate || 0) / kpis.totalConnections) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos Principales */}
                    <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Tendencia de Ingresos */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                <h3 className="text-base font-semibold text-gray-900">Tendencia de Ingresos (6 meses)</h3>
                            </div>
                            <div className="p-5">
                                <div style={{ height: '300px' }}>
                                    <Line data={incomesTrendData} options={incomesTrendOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Ingresos por Tipo */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                <h3 className="text-base font-semibold text-gray-900">Ingresos por Tipo (Mes Actual)</h3>
                            </div>
                            <div className="p-5">
                                <div style={{ height: '300px' }}>
                                    <Doughnut data={incomeByTypeData} options={doughnutOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Distribución y Rankings */}
                    <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Conexiones por Comunidad */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                <h3 className="text-base font-semibold text-gray-900">Pajas por Comunidad</h3>
                            </div>
                            <div className="p-5">
                                <div style={{ height: '300px' }}>
                                    <Bar data={connectionsByCommunityData} options={barOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Top Comunidades por Ingresos */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                <h3 className="text-base font-semibold text-gray-900">Top 5 Comunidades (Ingresos)</h3>
                            </div>
                            <div className="p-5">
                                <div style={{ height: '300px' }}>
                                    <Bar data={topCommunitiesData} options={barOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planes de Cuotas y Otros Pagos */}
                    <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Estadísticas de Planes de Cuotas */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                <h3 className="text-base font-semibold text-gray-900">Planes de Cuotas</h3>
                            </div>
                            <div className="p-5">
                                {/* Resumen General */}
                                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="text-3xl font-bold text-blue-600">{kpis.activePlans || 0}</div>
                                        <div className="mt-1 text-sm text-gray-600">Activos</div>
                                    </div>
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <div className="text-3xl font-bold text-green-600">{kpis.completedPlans || 0}</div>
                                        <div className="mt-1 text-sm text-gray-600">Completados</div>
                                    </div>
                                    <div className="rounded-lg bg-red-50 p-4">
                                        <div className="text-3xl font-bold text-red-600">{kpis.cancelledPlans || 0}</div>
                                        <div className="mt-1 text-sm text-gray-600">Cancelados</div>
                                    </div>
                                </div>

                                {/* División por Tipo */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Planes de Instalación */}
                                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                                        <h4 className="text-sm font-semibold text-purple-900 mb-3">Instalación</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-purple-700">Activos</span>
                                                <span className="text-sm font-bold text-purple-900">{installationPlans.active || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-purple-700">Completados</span>
                                                <span className="text-sm font-bold text-purple-900">{installationPlans.completed || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-purple-700">Cancelados</span>
                                                <span className="text-sm font-bold text-purple-900">{installationPlans.cancelled || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Planes de Medidor */}
                                    <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                                        <h4 className="text-sm font-semibold text-teal-900 mb-3">Medidor</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-teal-700">Activos</span>
                                                <span className="text-sm font-bold text-teal-900">{meterPlans.active || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-teal-700">Completados</span>
                                                <span className="text-sm font-bold text-teal-900">{meterPlans.completed || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-teal-700">Cancelados</span>
                                                <span className="text-sm font-bold text-teal-900">{meterPlans.cancelled || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Otros Pagos por Tipo */}
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                                <h3 className="text-base font-semibold text-gray-900">Otros Pagos por Tipo (Mes Actual)</h3>
                            </div>
                            <div className="p-5">
                                {otherPaymentsByType.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {otherPaymentsByType.map((item, index) => (
                                            <div key={index} className="flex flex-col rounded-lg border border-gray-200 p-3 hover:border-indigo-300 transition-colors">
                                                <div className="font-medium text-gray-900 text-sm truncate" title={item.type_name}>
                                                    {item.type_name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {item.count} {item.count === 1 ? 'transacción' : 'transacciones'}
                                                </div>
                                                <div className="font-semibold text-indigo-600 mt-2">
                                                    {formatCurrency(item.total)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        No hay otros pagos registrados este mes
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pagos Recientes */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                            <h3 className="text-base font-semibold text-gray-900">Pagos Recientes</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Recibo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Paja</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Comunidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {recentPayments.map((payment, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {payment.receipt_number}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold" 
                                                    style={{
                                                        backgroundColor: payment.type === 'monthly' ? '#EEF2FF' : 
                                                                       payment.type === 'other' ? '#F0FDF4' :
                                                                       payment.type === 'installment' ? '#FFF7ED' : '#F3F4F6',
                                                        color: payment.type === 'monthly' ? '#4F46E5' :
                                                              payment.type === 'other' ? '#16A34A' :
                                                              payment.type === 'installment' ? '#EA580C' : '#6B7280'
                                                    }}
                                                >
                                                    {payment.type_label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{payment.owner_name}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">#{payment.water_connection_number}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{payment.community}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(payment.payment_date)}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
