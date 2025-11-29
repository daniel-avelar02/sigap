import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { formatCurrency } from '@/Utils/helpers';
import InputLabel from '@/Components/InputLabel';

export default function Index({ reportData, filters, communities }) {
    const [reportType, setReportType] = useState(filters.report_type);
    const [date, setDate] = useState(filters.date);
    const [community, setCommunity] = useState(filters.community);

    const handleFilterChange = (newFilters) => {
        router.get(route('reports.index'), newFilters, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const handleReportTypeChange = (value) => {
        setReportType(value);
        handleFilterChange({ report_type: value, date, community });
    };

    const handleDateChange = (value) => {
        setDate(value);
        handleFilterChange({ report_type: reportType, date: value, community });
    };

    const handleCommunityChange = (value) => {
        setCommunity(value);
        handleFilterChange({ report_type: reportType, date, community: value });
    };

    const handleExportExcel = () => {
        window.open(route('reports.export-excel', { report_type: reportType, date, community }), '_blank');
    };

    const handleExportPdf = () => {
        window.open(route('reports.export-pdf', { report_type: reportType, date, community }), '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Reportes de Cobros
                    </h2>
                </div>
            }
        >
            <Head title="Reportes de Cobros" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filtros */}
                    <div className="mb-6 bg-white p-6 shadow sm:rounded-lg">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            {/* Tipo de Reporte */}
                            <div>
                                <InputLabel htmlFor="report_type" value="Tipo de Reporte" />
                                <select
                                    id="report_type"
                                    value={reportType}
                                    onChange={(e) => handleReportTypeChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="day">Diario</option>
                                    <option value="week">Semanal</option>
                                    <option value="month">Mensual</option>
                                    <option value="year">Anual</option>
                                </select>
                            </div>

                            {/* Fecha */}
                            <div>
                                <InputLabel htmlFor="date" value="Fecha de Referencia" />
                                <input
                                    type="date"
                                    id="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Comunidad */}
                            <div>
                                <InputLabel htmlFor="community" value="Comunidad" />
                                <select
                                    id="community"
                                    value={community}
                                    onChange={(e) => handleCommunityChange(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    {Object.values(communities).map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Botones de Exportación */}
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleExportExcel}
                                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={handleExportPdf}
                                    className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Título del Reporte */}
                    <div className="mb-6 bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-2xl font-bold text-gray-900">{reportData.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {reportData.period.start_formatted} - {reportData.period.end_formatted}
                        </p>
                    </div>

                    {/* Resumen General */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                        {/* Pagos Mensuales */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-md bg-blue-500 p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Pagos Mensuales</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatCurrency(reportData.summary.monthly.total)}
                                                </div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                                                    ({reportData.summary.monthly.count})
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Otros Pagos */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-md bg-green-500 p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Otros Pagos</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatCurrency(reportData.summary.other.total)}
                                                </div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                                                    ({reportData.summary.other.count})
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagos de Cuotas */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-md bg-purple-500 p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Pagos de Cuotas</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatCurrency(reportData.summary.installment.total)}
                                                </div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                                                    ({reportData.summary.installment.count})
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total General */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="rounded-md bg-indigo-600 p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total General</dt>
                                            <dd className="flex items-baseline">
                                                <div className="text-2xl font-semibold text-gray-900">
                                                    {formatCurrency(reportData.summary.grand_total)}
                                                </div>
                                                <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                                                    ({reportData.summary.total_payments})
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desglose de Otros Pagos */}
                    {reportData.other_payments_by_type.length > 0 && (
                        <div className="mb-6 bg-white shadow sm:rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Desglose de Otros Pagos</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {reportData.other_payments_by_type.map((type, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="text-sm font-medium text-gray-500">{type.type_label}</div>
                                            <div className="mt-1 flex items-baseline justify-between">
                                                <div className="text-xl font-semibold text-gray-900">
                                                    {formatCurrency(type.total)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {type.count} pago{type.count !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje si no hay datos */}
                    {reportData.summary.total_payments === 0 && (
                        <div className="bg-white shadow sm:rounded-lg p-10 text-center">
                            <p className="text-gray-500">No se encontraron pagos para el período seleccionado.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}