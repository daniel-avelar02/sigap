import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import CommunityBadge from '@/Components/CommunityBadge';

export default function Show({ payment, relatedPayments }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Comprobante de Pago
                    </h2>
                    <div className="flex gap-2 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                        >
                            Imprimir
                        </button>
                        <Link
                            href={route('monthly-payments.index')}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Comprobante ${payment.receipt_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* Comprobante */}
                    <div className="bg-white shadow sm:rounded-lg print:shadow-none">
                        <div className="p-8">
                            {/* Logo y Encabezado */}
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <ApplicationLogo className="h-20 w-auto" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Sistema de Gestión de Agua Potable
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">SIGAP</p>
                            </div>

                            <div className="border-t border-b border-gray-200 py-4 mb-6">
                                <h2 className="text-center text-xl font-semibold text-gray-900">
                                    COMPROBANTE DE PAGO MENSUAL
                                </h2>
                            </div>

                            {/* Número de Recibo */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Número de Recibo</p>
                                    <p className="text-3xl font-bold font-mono text-indigo-600">
                                        {payment.receipt_number}
                                    </p>
                                </div>
                            </div>

                            {/* Información del Pago */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                        Información de la Paja
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Número de Paja:</span>
                                            <p className="text-lg font-semibold text-gray-900">
                                                #{payment.water_connection.owner_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Comunidad:</span>
                                            <div className="mt-1">
                                                <CommunityBadge community={payment.water_connection.community} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                        Propietario
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Nombre:</span>
                                            <p className="font-medium text-gray-900">
                                                {payment.water_connection.owner.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">DUI:</span>
                                            <p className="text-gray-900">
                                                {payment.water_connection.owner.formatted_dui}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del Pago */}
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Detalles del Pago
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Período(s) Pagado(s):</span>
                                        {payment.months_paid && payment.months_paid.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {payment.months_paid.map((mp, index) => {
                                                    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                                    return (
                                                        <span key={index} className="inline-flex items-center rounded-md bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
                                                            {monthNames[mp.month - 1]}/{mp.year}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-lg font-semibold text-gray-900">
                                                {payment.month_name} {payment.payment_year}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Fecha de Pago:</span>
                                        <p className="font-medium text-gray-900">
                                            {new Date(payment.payment_date).toLocaleDateString('es-SV', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Meses incluidos en este pago */}
                            {payment.months_paid && payment.months_paid.length > 1 && (
                                <div className="border-t border-gray-200 pt-6 mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                        Resumen de Meses ({payment.months_paid.length} meses)
                                    </h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {payment.months_paid.map((mp, index) => {
                                                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                                                const monthlyFee = parseFloat(payment.total_amount) / payment.months_paid.length;
                                                return (
                                                    <div key={index} className="bg-white rounded-md p-3 border border-blue-200">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {monthNames[mp.month - 1]} {mp.year}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ${monthlyFee.toFixed(2)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Cuota mensual:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${(parseFloat(payment.total_amount) / payment.months_paid.length).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Información del Pagador */}
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Pagado por
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Nombre:</span>
                                        <p className="font-medium text-gray-900">
                                            {payment.payer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">DUI:</span>
                                        <p className="text-gray-900">
                                            {payment.payer_dui.slice(0, 8) + '-' + payment.payer_dui.slice(8)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Monto */}
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <div className="bg-indigo-50 rounded-lg p-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-700">Total Pagado:</span>
                                        <span className="text-3xl font-bold text-indigo-600">
                                            ${parseFloat(payment.total_amount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notas */}
                            {payment.notes && (
                                <div className="border-t border-gray-200 pt-6 mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        Observaciones:
                                    </h3>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                        {payment.notes}
                                    </p>
                                </div>
                            )}

                            {/* Pie del Comprobante */}
                            <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p>Registrado por: <span className="font-medium text-gray-900">{payment.user.name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p>Fecha de emisión:</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(payment.created_at).toLocaleDateString('es-SV')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 text-center text-xs text-gray-500">
                                    <p>Este es un comprobante oficial del Sistema de Gestión de Agua Potable</p>
                                    <p className="mt-1 font-medium">Conserve este comprobante para cualquier aclaración</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:shadow-none,
                    .print\\:shadow-none * {
                        visibility: visible;
                    }
                    .print\\:shadow-none {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
