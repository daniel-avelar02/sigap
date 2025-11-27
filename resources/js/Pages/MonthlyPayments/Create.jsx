import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import WaterConnectionSearchDropdown from '@/Components/WaterConnectionSearchDropdown';
import MultiMonthSelector from '@/Components/MultiMonthSelector';
import CommunityBadge from '@/Components/CommunityBadge';
import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import DuiInput from '@/Components/DuiInput';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ monthlyFee, currentMonth, currentYear }) {
    const [selectedWaterConnection, setSelectedWaterConnection] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        water_connection_id: '',
        selected_months: [],
        payer_name: '',
        payer_dui: '',
        monthly_fee_amount: monthlyFee,
        notes: '',
    });

    // Al seleccionar una paja, prellenar datos del pagador con el propietario
    const handleWaterConnectionSelect = (waterConnection) => {
        setSelectedWaterConnection(waterConnection);
        setData({
            ...data,
            water_connection_id: waterConnection.id,
            payer_name: waterConnection.owner.name,
            payer_dui: waterConnection.owner.dui.replace('-', ''),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('monthly-payments.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Registrar Pago Mensual
                    </h2>
                    <Link
                        href={route('monthly-payments.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Ver Historial
                    </Link>
                </div>
            }
        >
            <Head title="Registrar Pago Mensual" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Búsqueda de Paja */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                1. Buscar Paja de Agua
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Busque por código, número de paja, nombre o DUI del propietario
                            </p>
                        </div>

                        <WaterConnectionSearchDropdown
                            onSelect={handleWaterConnectionSelect}
                        />

                        {errors.water_connection_id && (
                            <InputError message={errors.water_connection_id} className="mt-2" />
                        )}
                    </div>

                    {/* Información de la Paja Seleccionada */}
                    {selectedWaterConnection && (
                        <>
                            <div className="bg-white p-6 shadow sm:rounded-lg">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">
                                    Información de la Paja
                                </h3>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Datos de la Paja */}
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Número de Paja:</span>
                                            <p className="mt-1 text-lg font-semibold text-blue-600">
                                                #{selectedWaterConnection.owner_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Comunidad:</span>
                                            <div className="mt-1">
                                                <CommunityBadge community={selectedWaterConnection.community} />
                                            </div>
                                        </div>
                                        {selectedWaterConnection.location_description && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Ubicación:</span>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {selectedWaterConnection.location_description}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Estados de Pago:</span>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {selectedWaterConnection.payment_status.map((status) => (
                                                    <PaymentStatusBadge key={status} status={status} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Datos del Propietario */}
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Propietario:</span>
                                            <p className="mt-1 text-lg font-medium text-gray-900">
                                                {selectedWaterConnection.owner.name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">DUI:</span>
                                            <p className="mt-1 text-gray-900">
                                                {selectedWaterConnection.owner.formatted_dui}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                                            <p className="mt-1 text-gray-900">
                                                {selectedWaterConnection.owner.formatted_phone}
                                            </p>
                                        </div>
                                        {selectedWaterConnection.owner.email && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Email:</span>
                                                <p className="mt-1 text-gray-900">
                                                    {selectedWaterConnection.owner.email}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Meses Pendientes */}
                                {selectedWaterConnection.has_pending_months && (
                                    <div className="mt-6 rounded-md bg-red-50 border border-red-200 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-red-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    Meses Pendientes de Pago ({selectedWaterConnection.pending_months.length})
                                                </h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {selectedWaterConnection.pending_months.slice(0, 5).map((pm, idx) => (
                                                            <li key={idx}>{pm.period}</li>
                                                        ))}
                                                        {selectedWaterConnection.pending_months.length > 5 && (
                                                            <li className="font-medium">
                                                                ...y {selectedWaterConnection.pending_months.length - 5} más
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Últimos Pagos */}
                                {selectedWaterConnection.recent_payments.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Últimos Pagos Registrados
                                        </h4>
                                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Recibo
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Período
                                                        </th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Fecha
                                                        </th>
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                            Monto
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {selectedWaterConnection.recent_payments.slice(0, 5).map((payment) => (
                                                        <tr key={payment.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm font-mono text-gray-900">
                                                                {payment.receipt_number}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                                {payment.payment_period}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                                {payment.payment_date}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                                                                ${parseFloat(payment.total_amount).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Formulario de Pago */}
                            <div className="bg-white p-6 shadow sm:rounded-lg">
                                <h3 className="mb-6 text-lg font-medium text-gray-900">
                                    2. Registrar Pago
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Selector de Múltiples Meses */}
                                    <MultiMonthSelector
                                        pendingMonths={selectedWaterConnection.pending_months}
                                        onSelectionChange={(months) => setData('selected_months', months)}
                                        monthlyFee={data.monthly_fee_amount}
                                        error={errors.selected_months}
                                    />

                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4">
                                            Datos del Pagador
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="payer_name" value="Nombre del Pagador" />
                                                <TextInput
                                                    id="payer_name"
                                                    type="text"
                                                    value={data.payer_name}
                                                    onChange={(e) => setData('payer_name', e.target.value)}
                                                    className="mt-1 block w-full"
                                                    placeholder="Nombre completo"
                                                />
                                                <InputError message={errors.payer_name} className="mt-2" />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="payer_dui" value="DUI del Pagador" />
                                                <DuiInput
                                                    id="payer_dui"
                                                    value={data.payer_dui}
                                                    onChange={(e) => setData('payer_dui', e.target.value)}
                                                    className="mt-1 block w-full"
                                                />
                                                <InputError message={errors.payer_dui} className="mt-2" />
                                            </div>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-500">
                                            * La persona que paga puede ser diferente del propietario titular
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-4">
                                            Monto del Pago
                                        </h4>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel htmlFor="monthly_fee_amount" value="Cuota Mensual" />
                                                <div className="relative mt-1">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                        $
                                                    </span>
                                                    <TextInput
                                                        id="monthly_fee_amount"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={data.monthly_fee_amount}
                                                        onChange={(e) => setData('monthly_fee_amount', e.target.value)}
                                                        className="block w-full pl-7"
                                                    />
                                                </div>
                                                <InputError message={errors.monthly_fee_amount} className="mt-2" />
                                            </div>

                                            <div className="flex items-end">
                                                <div className="rounded-md bg-gray-50 p-4 w-full">
                                                    <p className="text-sm text-gray-600">Cuota por mes:</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        ${parseFloat(data.monthly_fee_amount || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="notes" value="Observaciones (opcional)" />
                                        <textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Notas adicionales sobre este pago..."
                                        />
                                        <InputError message={errors.notes} className="mt-2" />
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                        <Link
                                            href={route('dashboard')}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Cancelar
                                        </Link>
                                        <PrimaryButton type="submit" disabled={processing}>
                                            {processing ? 'Registrando...' : 'Registrar Pago'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
