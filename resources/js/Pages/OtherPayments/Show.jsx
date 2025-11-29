import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import CommunityBadge from '@/Components/CommunityBadge';
import { formatCurrency, formatDUI, formatDateTime } from '@/Utils/helpers';
import { formatDui } from '@/Utils/helpers';

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
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Volver
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Comprobante ${otherPayment.receipt_number}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* Comprobante */}
                    <div className="bg-white shadow sm:rounded-lg print:shadow-none">
                        <div className="p-8">
                            {/* Logo, Encabezado y Número de Recibo */}
                            <div className="mb-8">
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <div className="text-left">
                                        <p className="text-xs text-gray-600 mb-1">Recibo N°</p>
                                        <p className="text-base font-bold font-mono text-gray-900">
                                            {otherPayment.receipt_number}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <ApplicationLogo className="h-10 w-auto" />
                                        <h1 className="text-2xl font-bold text-gray-900">SIGAP</h1>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-600 mb-1">Fecha y Hora de Pago</p>
                                        <p className="text-base font-bold text-gray-900">
                                            {new Date(otherPayment.payment_date).toLocaleDateString('es-SV', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xs font-medium text-gray-700">
                                            {new Date(otherPayment.payment_date).toLocaleTimeString('es-SV', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className=" py-1 mb-3">
                                <h2 className="text-center text-xl font-semibold text-gray-900">
                                    COMPROBANTE DE PAGO
                                </h2>
                            </div>


                            {/* Información del Pago */}
                            <div className="mb-6 grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 ">
                                        Información de la Paja
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Número de Paja:</span>
                                            <p className="text-lg font-semibold text-gray-900">
                                                #{otherPayment.water_connection.owner_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Comunidad:</span>
                                            <div className="mt-1">
                                                <CommunityBadge community={otherPayment.water_connection.community} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Propietario
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Nombre:</span>
                                            <p className="font-medium text-gray-900">
                                                {otherPayment.water_connection.owner.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">DUI:</span>
                                            <p className="text-gray-900">
                                                {formatDui(otherPayment.water_connection.owner.dui)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Detalles del Pago */}
                            <div className="pt-6 mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    Detalles del Pago
                                </h3>
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                Descripción
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                                Valor
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                                                {paymentTypeName} - {otherPayment.description}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                                                ${parseFloat(otherPayment.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-300 border-t-2 border-t-gray-400">
                                                TOTAL
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right border-t-2 border-t-gray-400">
                                                ${parseFloat(otherPayment.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>


                            {/* Información del Pagador */}
                            <div className="">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Pagado por
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Nombre:</span>
                                        <p className="font-medium text-gray-900">
                                            {otherPayment.payer_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">DUI:</span>
                                        <p className="text-gray-900">
                                            {otherPayment.payer_dui.slice(0, 8) + '-' + otherPayment.payer_dui.slice(8)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notas Adicionales */}
                            {otherPayment.additional_notes && (
                                <div className="pt-6 mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                        Observaciones:
                                    </h3>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                        {otherPayment.additional_notes}
                                    </p>
                                </div>
                            )}

                            {/* Pie del Comprobante */}
                            <div className="text-sm text-gray-600">
                                {/* <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p>Registrado por: <span className="font-medium text-gray-900">{payment.user.name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p>Fecha de emisión:</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(payment.created_at).toLocaleDateString('es-SV')}
                                        </p>
                                    </div>
                                </div> */}
                                <div className="mt-6 text-center text-xs text-gray-500">
                                    <p>Cton. Valle La Puerta, 1ra entrada, Tacuba, Ahuachapan.</p>
                                    <p>6830-8753   |   adescobd@gmail.com</p>

                                    <p className="mt-1 font-medium">Este es un comprobante de pago, su factura será enviada a su correo electrónico.</p>
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
