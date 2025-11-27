import { Link } from '@inertiajs/react';
import CommunityBadge from './CommunityBadge';
import InstallmentStatusBadge from './InstallmentStatusBadge';
import InstallmentProgressBar from './InstallmentProgressBar';

export default function InstallmentPlanCard({ plan, showActions = true, filters = {} }) {
    const PLAN_TYPE_LABELS = {
        installation: 'Instalación de paja',
        meter: 'Medidor',
    };

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <div className="p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {PLAN_TYPE_LABELS[plan.plan_type] || plan.plan_type}
                            </h3>
                            <InstallmentStatusBadge status={plan.status} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600">
                            Plan #{plan.id} • {plan.water_connection?.code}
                        </p>
                    </div>
                    {plan.water_connection?.community && (
                        <CommunityBadge community={plan.water_connection.community} size="sm" />
                    )}
                </div>

                {/* Propietario */}
                {plan.water_connection?.owner && (
                    <div className="mb-3 text-sm text-gray-700">
                        <span className="font-medium">Propietario:</span>{' '}
                        {plan.water_connection.owner.name}
                    </div>
                )}

                {/* Montos */}
                <div className="mb-4 grid grid-cols-3 gap-3 rounded-md bg-gray-50 p-3 text-sm">
                    <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-semibold text-gray-900">
                            ${parseFloat(plan.total_amount).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Pagado</p>
                        <p className="font-semibold text-green-600">
                            ${parseFloat(plan.total_paid || 0).toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Pendiente</p>
                        <p className="font-semibold text-orange-600">
                            ${parseFloat(plan.balance || 0).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Progreso */}
                <div className="mb-4">
                    <InstallmentProgressBar
                        percentage={plan.progress_percentage || 0}
                        installmentsPaid={plan.installments_paid_count || 0}
                        installmentsTotal={plan.installment_count}
                    />
                </div>

                {/* Acciones */}
                {showActions && (
                    <div className="flex gap-2">
                        <Link
                            href={route('installment-plans.show', [plan.id, filters])}
                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Ver detalles
                        </Link>
                        {plan.status === 'active' && plan.balance > 0 && (
                            <Link
                                href={route('installment-plans.create-payment', [plan.id, filters])}
                                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Pagar cuota
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
