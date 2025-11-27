import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommunityBadge from '@/Components/CommunityBadge';
import { formatCurrency, formatDUI, formatDateTime } from '@/Utils/helpers';

export default function Show({ otherPayment, paymentTypeName }) {
    const handlePrint = () => {
        window.print();
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
                        Comprobante de Otro Pago
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-700 print:hidden"
                        >
                            Imprimir
                        </button>
                        <Link
                            href={route('other-payments.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 hover:bg-gray-50 print:hidden"
                        >
                            Volver al Listado
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Comprobante ${otherPayment.receipt_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg print:shadow-none">
                        <div className="p-8 print:p-4">
                            {/* Encabezado del Comprobante */}
                            <div className="mb-8 border-b-2 border-gray-200 pb-6 text-center">
                                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                                    COMPROBANTE DE PAGO
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Sistema de Gestión de Agua Potable
                                </p>
                                <p className="mt-2 text-2xl font-bold text-blue-600">
                                    {otherPayment.receipt_number}
                                </p>
                            </div>

                            {/* Información Principal */}
                            <div className="mb-6 grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-gray-700">
                                        Información del Pago
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Fecha y Hora:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {formatDateTime(otherPayment.payment_date)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Tipo de Pago:
                                            </span>
                                            <p className="mt-1">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold bg-${getPaymentTypeBadgeColor(otherPayment.payment_type)}-100 text-${getPaymentTypeBadgeColor(otherPayment.payment_type)}-800`}>
                                                    {paymentTypeName}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Descripción:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {otherPayment.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-gray-700">
                                        Información de la Paja
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Código:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {otherPayment.water_connection.code}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Número de Propietario:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {otherPayment.water_connection.owner_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Comunidad:
                                            </span>
                                            <p className="mt-1">
                                                <CommunityBadge community={otherPayment.water_connection.community} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Propietario y Pagador */}
                            <div className="mb-6 grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-gray-700">
                                        Propietario Titular
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Nombre:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {otherPayment.water_connection.owner.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                DUI:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {formatDUI(otherPayment.water_connection.owner.dui)}
                                            </p>
                                        </div>
                                        {otherPayment.water_connection.owner.phone && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">
                                                    Teléfono:
                                                </span>
                                                <p className="text-sm text-gray-900">
                                                    {otherPayment.water_connection.owner.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold text-gray-700">
                                        Persona que Realizó el Pago
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                Nombre:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {otherPayment.payer_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">
                                                DUI:
                                            </span>
                                            <p className="text-sm text-gray-900">
                                                {formatDUI(otherPayment.payer_dui)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Monto */}
                            <div className="mb-6 rounded-lg bg-gray-50 p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-semibold text-gray-700">
                                        Monto Total Pagado:
                                    </span>
                                    <span className="text-3xl font-bold text-green-600">
                                        {formatCurrency(otherPayment.amount)}
                                    </span>
                                </div>
                            </div>

                            {/* Notas Adicionales */}
                            {otherPayment.additional_notes && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-lg font-semibold text-gray-700">
                                        Notas Adicionales
                                    </h3>
                                    <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-700">
                                        {otherPayment.additional_notes}
                                    </p>
                                </div>
                            )}

                            {/* Pie del Comprobante */}
                            <div className="mt-8 border-t-2 border-gray-200 pt-6">
                                <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                                    <div>
                                        <p>
                                            <span className="font-medium">Registrado por:</span>{' '}
                                            {otherPayment.user.name}
                                        </p>
                                        <p>
                                            <span className="font-medium">Fecha de registro:</span>{' '}
                                            {formatDateTime(otherPayment.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="italic">
                                            Este comprobante es válido sin firma ni sello
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
