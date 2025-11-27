import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import WaterConnectionSearchDropdown from '@/Components/WaterConnectionSearchDropdown';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { formatDUI } from '@/Utils/helpers';

export default function Create({ paymentTypes }) {
    const [selectedWaterConnection, setSelectedWaterConnection] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        water_connection_id: '',
        payment_type: '',
        description: '',
        amount: '',
        payer_name: '',
        payer_dui: '',
        additional_notes: '',
        payment_date: new Date().toISOString().split('T')[0],
    });

    const handleWaterConnectionSelect = (wc) => {
        setSelectedWaterConnection(wc);
        setData('water_connection_id', wc.id);
    };

    const handleDuiChange = (e) => {
        const formatted = formatDUI(e.target.value);
        setData('payer_dui', formatted);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('other-payments.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Registrar Otro Pago
                </h2>
            }
        >
            <Head title="Registrar Otro Pago" />

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
                                    {selectedWaterConnection && (
                                        <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm">
                                            <p className="font-medium text-gray-700">
                                                {selectedWaterConnection.owner.name}
                                            </p>
                                            <p className="text-gray-500">
                                                {selectedWaterConnection.code} - {selectedWaterConnection.owner_number}
                                            </p>
                                            <p className="text-gray-500">
                                                {selectedWaterConnection.community}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Tipo de Pago */}
                                <div>
                                    <InputLabel htmlFor="payment_type" value="Tipo de Pago *" />
                                    <select
                                        id="payment_type"
                                        value={data.payment_type}
                                        onChange={(e) => setData('payment_type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300"
                                    >
                                        <option value="">Seleccione un tipo</option>
                                        {Object.entries(paymentTypes).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.payment_type} className="mt-2" />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <InputLabel htmlFor="description" value="Descripción del Concepto *" />
                                    <TextInput
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Ej: Reconexión del servicio por morosidad"
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Monto */}
                                <div>
                                    <InputLabel htmlFor="amount" value="Monto *" />
                                    <TextInput
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.amount} className="mt-2" />
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
                                    />
                                    <InputError message={errors.payment_date} className="mt-2" />
                                </div>

                                {/* Información del Pagador */}
                                <div className="rounded-md border border-gray-200 p-4">
                                    <h3 className="mb-4 font-medium text-gray-700">Información del Pagador</h3>
                                    
                                    <div className="space-y-4">
                                        {/* Nombre del Pagador */}
                                        <div>
                                            <InputLabel htmlFor="payer_name" value="Nombre Completo *" />
                                            <TextInput
                                                id="payer_name"
                                                type="text"
                                                value={data.payer_name}
                                                onChange={(e) => setData('payer_name', e.target.value)}
                                                className="mt-1 block w-full"
                                                placeholder="Nombre de quien realiza el pago"
                                            />
                                            <InputError message={errors.payer_name} className="mt-2" />
                                        </div>

                                        {/* DUI del Pagador */}
                                        <div>
                                            <InputLabel htmlFor="payer_dui" value="DUI *" />
                                            <TextInput
                                                id="payer_dui"
                                                type="text"
                                                value={data.payer_dui}
                                                onChange={handleDuiChange}
                                                className="mt-1 block w-full"
                                                placeholder="12345678-9"
                                                maxLength={10}
                                            />
                                            <InputError message={errors.payer_dui} className="mt-2" />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Formato: 12345678-9
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notas Adicionales */}
                                <div>
                                    <InputLabel htmlFor="additional_notes" value="Notas Adicionales (Opcional)" />
                                    <textarea
                                        id="additional_notes"
                                        value={data.additional_notes}
                                        onChange={(e) => setData('additional_notes', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300"
                                        placeholder="Detalles adicionales sobre este pago..."
                                        maxLength={1000}
                                    />
                                    <InputError message={errors.additional_notes} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {data.additional_notes.length}/1000 caracteres
                                    </p>
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end space-x-4 border-t pt-6">
                                    <Link
                                        href={route('other-payments.index')}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Registrando...' : 'Registrar Pago'}
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
