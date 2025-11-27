/**
 * Componente de página para crear una nueva paja de agua.
 *
 * Este componente renderiza un formulario que permite registrar una nueva conexión de agua
 * asociada a un propietario. El código de la paja (WC-XXXXX) se genera automáticamente.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string[]} props.communities - Lista de comunidades disponibles.
 * @param {string[]} props.statuses - Estados operativos disponibles ('activa', 'suspendida').
 * @param {Object} [props.filters={}] - Filtros actuales para preservar al navegar.
 * @param {number} [props.preselectedOwnerId] - ID del propietario preseleccionado (opcional).
 *
 * @returns {JSX.Element} La página con el formulario de creación.
 *
 * @example
 * <Create communities={['Comunidad A']} statuses={['activa', 'suspendida']} />
 */

import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OwnerSearchDropdown from '@/Components/OwnerSearchDropdown';
import OwnerNumberHelper from '@/Components/OwnerNumberHelper';

export default function Create({ communities, statuses, filters = {}, preselectedOwnerId }) {
    const { data, setData, post, processing, errors } = useForm({
        owner_number: '',
        owner_id: preselectedOwnerId || '',
        community: '',
        location_description: '',
        status: 'activa',
        comments: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('water-connections.store', filters));
    };

    const handleOwnerSelect = (owner) => {
        setData({
            ...data,
            owner_id: owner.id,
            community: owner.community, // Auto-completar comunidad
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Nueva Paja de Agua
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
            <Head title="Nueva Paja de Agua" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="space-y-6">
                                {/* Nota sobre código automático */}
                                {/* <div className="rounded-md bg-blue-50 p-4">
                                    <p className="text-sm text-blue-700">
                                        <strong>Nota:</strong> El código de la paja (WC-XXXXX) se generará automáticamente al crear el registro.
                                    </p>
                                </div> */}

                                {/* Propietario */}
                                <div>
                                    <InputLabel htmlFor="owner_id" value="Propietario *" />
                                    <OwnerSearchDropdown
                                        onSelect={handleOwnerSelect}
                                        placeholder="Buscar por nombre o DUI..."
                                    />
                                    <InputError message={errors.owner_id} className="mt-2" />
                                    {data.owner_id && (
                                        <p className="mt-2 text-sm text-green-600">
                                            ✓ Propietario seleccionado
                                        </p>
                                    )}
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
                                        placeholder="Ej: Casa frente al parque central..."
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
                                        placeholder="Observaciones adicionales..."
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
                                        Guardar Paja de Agua
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
