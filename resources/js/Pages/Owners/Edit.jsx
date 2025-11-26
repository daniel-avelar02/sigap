/**
 * Componente de página para editar la información de un propietario existente.
 *
 * Este componente renderiza un formulario prellenado con los datos del propietario,
 * permitiendo modificar su nombre, DUI, teléfono, dirección y comunidad.
 * Utiliza `AuthenticatedLayout` para mantener el contexto de autenticación y
 * `useForm` de Inertia.js para el manejo del estado del formulario y envío de datos.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.owner - Objeto con la información actual del propietario a editar.
 * @param {number} props.owner.id - Identificador único del propietario.
 * @param {string} props.owner.name - Nombre completo del propietario.
 * @param {string} props.owner.dui - Documento Único de Identidad del propietario.
 * @param {string} props.owner.phone - Número de teléfono del propietario.
 * @param {string} [props.owner.address] - Dirección del propietario (opcional).
 * @param {string} props.owner.community - Comunidad a la que pertenece el propietario.
 * @param {string[]} props.communities - Lista de nombres de comunidades disponibles para seleccionar.
 * @param {Object} [props.filters={}] - Filtros de búsqueda actuales para mantener el estado al regresar al listado.
 *
 * @returns {JSX.Element} La página de edición de propietario renderizada.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import DuiInput from '@/Components/DuiInput';
import PhoneInput from '@/Components/PhoneInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ owner, communities, filters = {} }) {

    const { data, setData, patch, processing, errors } = useForm({
        name: owner.name || '',
        dui: owner.dui || '',
        phone: owner.phone || '',
        email: owner.email || '',
        address: owner.address || '',
        community: owner.community || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('owners.update', [owner.id, filters]));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Editar Propietario
                    </h2>
                    <Link
                        href={route('owners.index', filters)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Volver al listado de propietarios
                    </Link>
                </div>
            }
        >
            <Head title={`Editar: ${owner.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="space-y-6">
                                {/* Nombre */}
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre completo" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        isFocused
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* DUI */}
                                <div>
                                    <InputLabel htmlFor="dui" value="DUI (9 dígitos)" />
                                    <DuiInput
                                        id="dui"
                                        value={data.dui}
                                        onChange={(e) => setData('dui', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.dui} className="mt-2" />
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <InputLabel htmlFor="phone" value="Teléfono (8 dígitos)" />
                                    <PhoneInput
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                {/* Correo electrónico */}
                                <div>
                                    <InputLabel htmlFor="email" value="Correo electrónico (opcional)" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="ejemplo@correo.com"
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                {/* Dirección */}
                                <div>
                                    <InputLabel htmlFor="address" value="Dirección (opcional)" />
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="3"
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                {/* Comunidad */}
                                <div>
                                    <InputLabel htmlFor="community" value="Comunidad" />
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
                                    <InputError message={errors.community} className="mt-2" />
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end gap-4">
                                    <Link
                                        href={route('owners.index', filters)}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Actualizar Propietario
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
