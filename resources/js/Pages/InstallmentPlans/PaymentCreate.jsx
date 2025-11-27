import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InstallmentSelector from '@/Components/InstallmentSelector';
import InstallmentProgressBar from '@/Components/InstallmentProgressBar';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import DuiInput from '@/Components/DuiInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { cleanDui } from '@/Utils/helpers';

export default function PaymentCreate({ plan, pendingInstallments, filters }) {
    const [selectedInstallments, setSelectedInstallments] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        installment_plan_id: plan.id,
        installment_number: '',
        payment_date: new Date().toISOString().split('T')[0],
        payer_name: plan.water_connection.owner.name,
        payer_dui: plan.water_connection.owner.dui,
        amount_paid: '',
        notes: '',
    });

    const handleInstallmentSelection = (installments) => {
        setSelectedInstallments(installments);
        
        if (installments.length > 0) {
            // Tomar la primera cuota seleccionada
            const firstInstallment = installments[0];
            setData({
                ...data,
                installment_number: firstInstallment.number,
                amount_paid: firstInstallment.suggested_amount,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const submitData = {
            ...data,
            payer_dui: cleanDui(data.payer_dui),
        };
        
        post(route('installment-plans.store-payment', [plan.id, filters]), {
            data: submitData,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Registrar Pago de Cuota
                    </h2>
                    <Link
                        href={route('installment-plans.show', [plan.id, filters])}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Volver
                    </Link>
                </div>
            }
        >
            <Head title="Registrar Pago de Cuota" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Información del Plan */}
                    <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">
                                {plan.plan_type_name} - {plan.water_connection.owner.name}
                            </h3>
                            <InstallmentProgressBar
                                percentage={plan.progress_percentage}
                                installmentsPaid={plan.installments_paid_count}
                                installmentsTotal={plan.installment_count}
                            />
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-6">
                                {/* Selector de Cuotas */}
                                <div>
                                    <InstallmentSelector
                                        pendingInstallments={pendingInstallments}
                                        suggestedAmount={plan.installment_amount}
                                        balance={plan.balance}
                                        onSelectionChange={handleInstallmentSelection}
                                    />
                                    <InputError message={errors.installment_number} className="mt-2" />
                                </div>

                                {/* Fecha de Pago */}
                                <div>
                                    <InputLabel htmlFor="payment_date" value="Fecha de Pago *" />
                                    <TextInput
                                        id="payment_date"
                                        type="date"
                                        value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        className="mt-1 block w-full"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <InputError message={errors.payment_date} className="mt-2" />
                                </div>

                                {/* Datos del Pagador */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="payer_name" value="Nombre del Pagador *" />
                                        <TextInput
                                            id="payer_name"
                                            value={data.payer_name}
                                            onChange={(e) => setData('payer_name', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.payer_name} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="payer_dui" value="DUI del Pagador *" />
                                        <DuiInput
                                            id="payer_dui"
                                            value={data.payer_dui}
                                            onChange={(e) => setData('payer_dui', e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.payer_dui} className="mt-2" />
                                    </div>
                                </div>

                                {/* Monto Pagado */}
                                <div>
                                    <InputLabel htmlFor="amount_paid" value="Monto Pagado *" />
                                    <TextInput
                                        id="amount_paid"
                                        type="number"
                                        step="0.01"
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.amount_paid} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Puede modificar el monto si el pago es parcial o incluye un adelanto
                                    </p>
                                </div>

                                {/* Notas */}
                                <div>
                                    <InputLabel htmlFor="notes" value="Notas (opcional)" />
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300"
                                        placeholder="Ej: Pago atrasado de cuota, abono extra a capital, etc."
                                    />
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end gap-4">
                                    <Link
                                        href={route('installment-plans.show', [plan.id, filters])}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing || selectedInstallments.length === 0}>
                                        Registrar Pago
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
