/**
 * Componente de página para visualizar los detalles de una paja de agua específica.
 *
 * Muestra la información completa de la conexión de agua incluyendo el código,
 * propietario asociado, ubicación, estados (operativo y de pago) y comentarios.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.waterConnection - La paja de agua con owner eager loaded.
 * @param {Object} [props.filters={}] - Filtros para preservar al navegar.
 *
 * @returns {JSX.Element} La página con los detalles de la paja de agua.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommunityBadge from '@/Components/CommunityBadge';
import StatusBadge from '@/Components/StatusBadge';
import PaymentStatusBadge from '@/Components/PaymentStatusBadge';
import { formatDui } from '@/Utils/helpers';

export default function Show({ waterConnection, filters = {} }) {
    const formattedDate = new Date(waterConnection.created_at).toLocaleDateString('es-SV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Detalles de Paja de Agua
                    </h2>
                    <div className="flex gap-3">
                        {/* {waterConnection.status === 'activa' && (
                            <>
                                <Link
                                    href={route('water-connections.edit', [waterConnection.id, filters])}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Editar
                                </Link>
                                <p className="text-sm text-gray-600">|</p>
                            </>
                        )} */}
                        <Link
                            href={route('water-connections.index', filters)}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Volver al listado de pajas de agua
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={waterConnection.code} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    {/* Información de la Paja de Agua */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Información de la Conexión
                            </h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Código
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                                        {waterConnection.code}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Número de propietario
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {waterConnection.owner_number || (
                                            <span className="italic text-gray-400">N/A</span>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Comunidad
                                    </dt>
                                    <dd className="mt-1">
                                        <CommunityBadge community={waterConnection.community} size="md" />
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Estado operativo
                                    </dt>
                                    <dd className="mt-1">
                                        <StatusBadge status={waterConnection.status} size="md" />
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Estado de pago
                                    </dt>
                                    <dd className="mt-1">
                                        <PaymentStatusBadge paymentStatus={waterConnection.payment_status} size="md" />
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Registrada el
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formattedDate}
                                    </dd>
                                </div>

                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Descripción de ubicación
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {waterConnection.location_description || (
                                            <span className="italic text-gray-400">No especificada</span>
                                        )}
                                    </dd>
                                </div>

                                {waterConnection.comments && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Comentarios
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {waterConnection.comments}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Información del Propietario */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Propietario
                                </h3>
                                <Link
                                    href={route('owners.show', waterConnection.owner.id)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Ver perfil completo →
                                </Link>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Nombre
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {waterConnection.owner.name}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        DUI
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDui(waterConnection.owner.dui)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Teléfono
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {waterConnection.owner.phone}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Comunidad del propietario
                                    </dt>
                                    <dd className="mt-1">
                                        <CommunityBadge community={waterConnection.owner.community} size="sm" />
                                    </dd>
                                </div>

                                {waterConnection.owner.address && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">
                                            Dirección
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {waterConnection.owner.address}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
