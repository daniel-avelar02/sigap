import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import CommunityBadge from '@/Components/CommunityBadge';
import InstallmentStatusBadge from '@/Components/InstallmentStatusBadge';
import InstallmentProgressBar from '@/Components/InstallmentProgressBar';
import { formatDui } from '@/Utils/helpers';

export default function Show({ plan, pendingInstallments, filters }) {
    const { delete: destroy } = useForm();

    const handleDelete = () => {
        if (confirm('¿Está seguro de eliminar este plan?')) {
            destroy(route('installment-plans.destroy', [plan.id, filters]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Detalle del Plan de Cuotas
                    </h2>
                    <Link
                        href={route('installment-plans.index', filters)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Volver al listado
                    </Link>
                </div>
            }
        >
            <Head title={`Plan #${plan.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    {/* Información del Plan */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {plan.plan_type_name} - Plan #{plan.id}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Creado el {new Date(plan.created_at).toLocaleDateString('es-SV')}
                                    </p>
                                </div>
                                <InstallmentStatusBadge status={plan.status} />
                            </div>

                            <div className="mb-6">
                                <InstallmentProgressBar
                                    percentage={plan.progress_percentage}
                                    installmentsPaid={plan.installments_paid_count}
                                    installmentsTotal={plan.installment_count}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Monto Total</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                                        ${parseFloat(plan.total_amount).toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Total Pagado</dt>
                                    <dd className="mt-1 text-lg font-semibold text-green-600">
                                        ${parseFloat(plan.total_paid).toFixed(2)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Saldo Pendiente</dt>
                                    <dd className="mt-1 text-lg font-semibold text-orange-600">
                                        ${parseFloat(plan.balance).toFixed(2)}
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información de la Paja */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">Paja de Agua</h3>
                            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Código</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{plan.water_connection.code}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Comunidad</dt>
                                    <dd className="mt-1">
                                        <CommunityBadge community={plan.water_connection.community} size="sm" />
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Propietario</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{plan.water_connection.owner.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">DUI</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDui(plan.water_connection.owner.dui)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Pagos Realizados */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Historial de Pagos ({plan.payments.length})
                            </h3>
                            {plan.payments.length === 0 ? (
                                <p className="text-center text-gray-500">No hay pagos registrados aún.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Cuota</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Monto</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Recibo</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {plan.payments.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-4 py-3 text-sm">Cuota #{payment.installment_number}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {new Date(payment.payment_date).toLocaleDateString('es-SV')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold">
                                                        ${parseFloat(payment.amount_paid).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{payment.receipt_number}</td>
                                                    <td className="px-4 py-3 text-right text-sm">
                                                        <Link
                                                            href={route('installment-plans.payment-receipt', [plan.id, payment.id, filters])}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Ver comprobante
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-4">
                        {plan.status === 'active' && plan.balance > 0 && (
                            <Link
                                href={route('installment-plans.create-payment', [plan.id, filters])}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Pagar Cuota
                            </Link>
                        )}
                        {plan.status === 'active' && (
                            <Link
                                href={route('installment-plans.edit', [plan.id, filters])}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Editar Plan
                            </Link>
                        )}
                        {!plan.deleted_at && (
                            <button
                                onClick={handleDelete}
                                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                            >
                                Eliminar Plan
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
