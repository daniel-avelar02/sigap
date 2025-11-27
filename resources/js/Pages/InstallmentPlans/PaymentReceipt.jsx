import { Head, Link } from '@inertiajs/react';
import { formatDui } from '@/Utils/helpers';

export default function PaymentReceipt({ plan, payment, filters }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title={`Comprobante ${payment.receipt_number}`} />

            <div className="mx-auto max-w-3xl">
                {/* Botones de acción (no se imprimen) */}
                <div className="mb-4 flex gap-4 print:hidden">
                    <Link
                        href={route('installment-plans.show', [plan.id, filters])}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        ← Volver al plan
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Imprimir Comprobante
                    </button>
                </div>

                {/* Comprobante */}
                <div className="overflow-hidden bg-white shadow-lg">
                    <div className="border-b-4 border-indigo-600 p-8">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                COMPROBANTE DE PAGO
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Sistema de Gestión de Agua Potable (SIGAP)
                            </p>
                            <div className="mt-4 inline-block rounded-md bg-indigo-100 px-4 py-2">
                                <p className="text-xs font-medium text-indigo-900">Recibo No.</p>
                                <p className="text-2xl font-bold text-indigo-900">{payment.receipt_number}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Información del Pago */}
                        <div className="mb-6">
                            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-900">
                                Información del Pago
                            </h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Fecha de Pago</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {new Date(payment.payment_date).toLocaleDateString('es-SV', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Tipo de Pago</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {plan.plan_type_name} - Cuota #{payment.installment_number}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Monto Pagado</dt>
                                    <dd className="mt-1 text-2xl font-bold text-green-600">
                                        ${parseFloat(payment.amount_paid).toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Saldo Pendiente del Plan</dt>
                                    <dd className="mt-1 text-lg font-semibold text-orange-600">
                                        ${parseFloat(plan.balance).toFixed(2)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Información del Propietario/Paja */}
                        <div className="mb-6">
                            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-900">
                                Información de la Paja de Agua
                            </h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Código de Paja</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {plan.water_connection.code}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Comunidad</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {plan.water_connection.community}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Propietario</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {plan.water_connection.owner.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">DUI</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {formatDui(plan.water_connection.owner.dui)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Información del Pagador */}
                        <div className="mb-6">
                            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-900">
                                Información del Pagador
                            </h2>
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {payment.payer_name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">DUI</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {formatDui(payment.payer_dui)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Progreso del Plan */}
                        <div className="mb-6">
                            <h2 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-900">
                                Progreso del Plan
                            </h2>
                            <dl className="grid grid-cols-3 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total del Plan</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        ${parseFloat(plan.total_amount).toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total Pagado</dt>
                                    <dd className="mt-1 text-sm font-semibold text-green-600">
                                        ${parseFloat(plan.total_paid).toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Cuotas</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {plan.installments_paid_count} de {plan.installment_count} pagadas
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Notas */}
                        {payment.notes && (
                            <div className="mb-6">
                                <h2 className="mb-2 text-sm font-semibold text-gray-900">Notas:</h2>
                                <p className="text-sm text-gray-700">{payment.notes}</p>
                            </div>
                        )}

                        {/* Pie de página */}
                        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-500">
                            <p>Este comprobante fue generado el {new Date().toLocaleString('es-SV')}</p>
                            <p className="mt-1">
                                Registrado por: {payment.user?.name || 'Sistema'}
                            </p>
                            <p className="mt-4 font-medium">
                                Gracias por su pago. Conserve este comprobante para sus registros.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
