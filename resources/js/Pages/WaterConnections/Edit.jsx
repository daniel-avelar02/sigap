/**
 * Componente de página para editar una paja de agua existente.
 *
 * Permite modificar los datos de una conexión de agua. El código (WC-XXXXX) y el estado
 * de pago no son editables, ya que el primero es único generado y el segundo se actualiza
 * automáticamente desde el módulo de cobros.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.waterConnection - La paja de agua a editar (incluye relación owner).
 * @param {string[]} props.communities - Lista de comunidades disponibles.
 * @param {string[]} props.statuses - Estados operativos disponibles.
 * @param {Object} [props.filters={}] - Filtros actuales para preservar al navegar.
 *
 * @returns {JSX.Element} La página con el formulario de edición.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OwnerSearchDropdown from '@/Components/OwnerSearchDropdown';
import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import OwnerNumberHelper from '@/Components/OwnerNumberHelper';

export default function Edit({ waterConnection, communities, statuses, filters = {} }) {
    const { data, setData, patch, processing, errors } = useForm({
        owner_number: waterConnection.owner_number || '',
        owner_id: waterConnection.owner_id,
        community: waterConnection.community,
        location_description: waterConnection.location_description || '',
        status: waterConnection.status,
        comments: waterConnection.comments || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('water-connections.update', [waterConnection.id, filters]));
    };

    const handleOwnerSelect = (owner) => {
        setData({
            ...data,
            owner_id: owner.id,
            community: owner.community,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Editar Paja de Agua: {waterConnection.code}
                    </h2>
                    <Link
                        href={route('water-connections.index', filters)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Volver al listado de pajas de agua
                    </Link>
                </div>
            }
        >
            <Head title={`Editar ${waterConnection.code}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="space-y-6">
                                {/* Código (readonly) */}
                                <div>
                                    <InputLabel htmlFor="code" value="Código de la paja" />
                                    <TextInput
                                        id="code"
                                        type="text"
                                        value={waterConnection.code}
                                        className="mt-1 block w-full bg-gray-100"
                                        disabled
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        El código no puede modificarse una vez generado.
                                    </p>
                                </div>

                                {/* Estado de pago (readonly) */}
                                <div>
                                    <InputLabel value="Estado de pago" />
                                    <div className="mt-2">
                                        <PaymentStatusBadge paymentStatus={waterConnection.payment_status} />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Este estado se actualiza automáticamente desde el módulo de cobros.
                                    </p>
                                </div>

                                {/* Propietario */}
                                <div>
                                    <InputLabel htmlFor="owner_id" value="Propietario *" />
                                    <p className="mt-1 text-sm text-gray-700">
                                        <strong>Actual:</strong> {waterConnection.owner.name} ({waterConnection.owner.formatted_dui})
                                    </p>
                                    <div className="mt-2">
                                        <OwnerSearchDropdown
                                            onSelect={handleOwnerSelect}
                                            placeholder="Buscar para cambiar propietario..."
                                        />
                                    </div>
                                    <InputError message={errors.owner_id} className="mt-2" />
                                </div>

                                {/* Comunidad (auto-llenada desde propietario) */}
                                <div>
                                    <InputLabel htmlFor="community" value="Comunidad *" />
                                    <select
                                        id="community"
                                        value={data.community}
                                        onChange={(e) => setData('community', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Seleccione una comunidad</option>
                                        {communities.map((community) => (
                                            <option key={community} value={community}>
                                                {community}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Se completa automáticamente al seleccionar el propietario, pero puede modificarse.
                                    </p>
                                    <InputError message={errors.community} className="mt-2" />
                                </div>

                                {/* Número de propietario */}
                                <div>
                                    <InputLabel htmlFor="owner_number" value="Número de propietario *" />
                                    <TextInput
                                        id="owner_number"
                                        type="text"
                                        value={data.owner_number}
                                        onChange={(e) => setData('owner_number', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Código único del propietario en su comunidad.
                                    </p>
                                    <InputError message={errors.owner_number} className="mt-2" />
                                    
                                    {/* Helper de números disponibles */}
                                    <OwnerNumberHelper 
                                        community={data.community}
                                        currentValue={data.owner_number}
                                        excludeId={waterConnection.id}
                                    />
                                </div>

                                {/* Descripción de ubicación */}
                                <div>
                                    <InputLabel htmlFor="location_description" value="Descripción de ubicación (opcional)" />
                                    <textarea
                                        id="location_description"
                                        value={data.location_description}
                                        onChange={(e) => setData('location_description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="3"
                                    />
                                    <InputError message={errors.location_description} className="mt-2" />
                                </div>

                                {/* Estado */}
                                <div>
                                    <InputLabel htmlFor="status" value="Estado operativo" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Comentarios */}
                                <div>
                                    <InputLabel htmlFor="comments" value="Comentarios (opcional)" />
                                    <textarea
                                        id="comments"
                                        value={data.comments}
                                        onChange={(e) => setData('comments', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="3"
                                    />
                                    <InputError message={errors.comments} className="mt-2" />
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end gap-4">
                                    <Link
                                        href={route('water-connections.index', filters)}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Actualizar Paja de Agua
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
