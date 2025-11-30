/**
 * Componente de página para crear un nuevo propietario.
 *
 * Este componente renderiza un formulario que permite a los usuarios ingresar información
 * para registrar un nuevo propietario en el sistema. Soporta dos tipos de propietarios:
 * personas naturales (con DUI) y organizaciones/empresas (con NIT).
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.ownerTypes - Tipos de propietarios disponibles ('natural', 'organization').
 * @param {string[]} props.communities - Lista de nombres de comunidades disponibles para seleccionar.
 * @param {Object} [props.filters={}] - Filtros actuales de la URL (opcional), utilizados para mantener el estado al navegar o redirigir.
 *
 * @returns {JSX.Element} La página renderizada con el formulario de creación de propietario.
 *
 * @example
 * <Create ownerTypes={{'natural': 'Persona Natural', 'organization': 'Organización/Empresa'}} communities={['Comunidad A', 'Comunidad B']} />
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import DuiInput from '@/Components/DuiInput';
import TaxIdInput from '@/Components/TaxIdInput';
import PhoneInput from '@/Components/PhoneInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ ownerTypes, communities, filters = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        owner_type: 'natural',
        name: '',
        dui: '',
        tax_id: '',
        phone: '',
        email: '',
        address: '',
        community: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('owners.store', filters));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Nuevo Propietario
                    </h2>
                    <Link
                        href={route('owners.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Volver al listado de propietarios
                    </Link>
                </div>
            }
        >
            <Head title="Nuevo Propietario" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="space-y-6">
                                {/* Tipo de Propietario */}
                                <div>
                                    <InputLabel htmlFor="owner_type" value="Tipo de propietario *" />
                                    <select
                                        id="owner_type"
                                        name="owner_type"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.owner_type}
                                        onChange={(e) => setData('owner_type', e.target.value)}
                                        required
                                    >
                                        {Object.entries(ownerTypes).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.owner_type} className="mt-2" />
                                </div>

                                {/* Nombre Completo */}
                                <div>
                                    <InputLabel htmlFor="name" value="Nombre completo *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* DUI o NIT según tipo */}
                                {data.owner_type === 'natural' ? (
                                    <div>
                                        <InputLabel htmlFor="dui" value="DUI (9 dígitos, opcional)" />
                                        <DuiInput
                                            id="dui"
                                            name="dui"
                                            value={data.dui}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('dui', e.target.value)}
                                        />
                                        <InputError message={errors.dui} className="mt-2" />
                                    </div>
                                ) : (
                                    <div>
                                        <InputLabel htmlFor="tax_id" value="NIT (opcional)" />
                                        <TaxIdInput
                                            id="tax_id"
                                            name="tax_id"
                                            value={data.tax_id}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('tax_id', e.target.value)}
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Formato: 0210-090676-001-4
                                        </p>
                                        <InputError message={errors.tax_id} className="mt-2" />
                                    </div>
                                )}

                                {/* Teléfono */}
                                <div>
                                    <InputLabel htmlFor="phone" value="Teléfono (8 dígitos, opcional)" />
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        value={data.phone}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                {/* Correo electrónico */}
                                <div>
                                    <InputLabel htmlFor="email" value="Correo electrónico (opcional)" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                {/* Dirección */}
                                <div>
                                    <InputLabel htmlFor="address" value="Dirección (opcional)" />
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={data.address}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows="3"
                                        onChange={(e) => setData('address', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                {/* Comunidad */}
                                <div>
                                    <InputLabel htmlFor="community" value="Comunidad *" />
                                    <select
                                        id="community"
                                        name="community"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.community}
                                        onChange={(e) => setData('community', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione una comunidad</option>
                                        {communities.map((community, index) => (
                                            <option key={index} value={community}>
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
                                        Guardar Propietario
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
