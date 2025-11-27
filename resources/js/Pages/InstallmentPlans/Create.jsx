import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import WaterConnectionSearchDropdown from '@/Components/WaterConnectionSearchDropdown';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ communities, planTypes, suggestedAmounts, defaultTerm, filters, preselectedWaterConnectionId }) {
    const [selectedWaterConnection, setSelectedWaterConnection] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        water_connection_id: preselectedWaterConnectionId || '',
        plan_type: '',
        total_amount: '',
        installment_count: defaultTerm,
        installment_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleWaterConnectionSelect = (wc) => {
        setSelectedWaterConnection(wc);
        setData('water_connection_id', wc.id);
    };

    const handlePlanTypeChange = (type) => {
        setData({
            ...data,
            plan_type: type,
            total_amount: suggestedAmounts[type] || '',
            installment_amount: data.installment_count > 0 ? ((suggestedAmounts[type] || 0) / data.installment_count).toFixed(2) : '',
        });
    };

    const handleAmountChange = (field, value) => {
        const newData = { ...data, [field]: value };
        
        if (field === 'total_amount' || field === 'installment_count') {
            const total = parseFloat(newData.total_amount) || 0;
            const count = parseInt(newData.installment_count) || 1;
            newData.installment_amount = count > 0 ? (total / count).toFixed(2) : '0.00';
        }
        
        setData(newData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('installment-plans.store', filters));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Crear Plan de Cuotas
                </h2>
            }
        >
            <Head title="Crear Plan de Cuotas" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-6">
                                {/* Búsqueda de Paja */}
                                <div>
                                    <InputLabel value="Paja de Agua *" />
                                    <WaterConnectionSearchDropdown
                                        onSelect={handleWaterConnectionSelect}
                                        selectedWaterConnection={selectedWaterConnection}
                                    />
                                    <InputError message={errors.water_connection_id} className="mt-2" />
                                </div>

                                {/* Tipo de Plan */}
                                <div>
                                    <InputLabel htmlFor="plan_type" value="Tipo de Plan *" />
                                    <select
                                        id="plan_type"
                                        value={data.plan_type}
                                        onChange={(e) => handlePlanTypeChange(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300"
                                    >
                                        <option value="">Seleccione un tipo</option>
                                        {Object.entries(planTypes).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.plan_type} className="mt-2" />
                                </div>

                                {/* Monto Total */}
                                <div>
                                    <InputLabel htmlFor="total_amount" value="Monto Total *" />
                                    <TextInput
                                        id="total_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.total_amount}
                                        onChange={(e) => handleAmountChange('total_amount', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.total_amount} className="mt-2" />
                                </div>

                                {/* Número de Cuotas */}
                                <div>
                                    <InputLabel htmlFor="installment_count" value="Número de Cuotas *" />
                                    <TextInput
                                        id="installment_count"
                                        type="number"
                                        value={data.installment_count}
                                        onChange={(e) => handleAmountChange('installment_count', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.installment_count} className="mt-2" />
                                </div>

                                {/* Monto por Cuota */}
                                <div>
                                    <InputLabel htmlFor="installment_amount" value="Monto por Cuota *" />
                                    <TextInput
                                        id="installment_amount"
                                        type="number"
                                        step="0.01"
                                        value={data.installment_amount}
                                        onChange={(e) => setData('installment_amount', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.installment_amount} className="mt-2" />
                                </div>

                                {/* Fecha de Inicio */}
                                <div>
                                    <InputLabel htmlFor="start_date" value="Fecha de Inicio *" />
                                    <TextInput
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.start_date} className="mt-2" />
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
                                    />
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end gap-4">
                                    <Link
                                        href={route('installment-plans.index', filters)}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Crear Plan
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
