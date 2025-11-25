/**
 * Componente de página para visualizar los detalles de un propietario específico.
 *
 * Muestra la información personal del propietario (nombre, DUI, teléfono, dirección, comunidad),
 * su estado (activo/inactivo) y un resumen de sus pajas de agua asociadas.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {Object} props.owner - Objeto con la información del propietario.
 * @param {number} props.owner.id - Identificador único del propietario.
 * @param {string} props.owner.name - Nombre completo del propietario.
 * @param {string} props.owner.dui - Documento Único de Identidad del propietario.
 * @param {string} props.owner.phone - Número de teléfono de contacto.
 * @param {string} props.owner.address - Dirección física del propietario.
 * @param {Object} props.owner.community - Objeto con información de la comunidad a la que pertenece.
 * @param {string|null} props.owner.deleted_at - Fecha de eliminación lógica (si existe) para determinar el estado.
 * @param {string} props.owner.created_at - Fecha de registro del propietario.
 * @param {number} props.waterConnectionsCount - Cantidad total de pajas de agua asociadas al propietario.
 *
 * @returns {JSX.Element} La página renderizada con los detalles del propietario.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommunityBadge from '@/Components/CommunityBadge';
import { formatDui } from '@/Utils/helpers';

export default function Show({ owner, waterConnectionsCount }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Detalles del Propietario
                    </h2>
                    <div className="flex gap-3">
                        {!owner.deleted_at && (
                            <Link
                                href={route('owners.edit', owner.id)}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Editar
                            </Link>
                        )}
                        <p className="text-sm text-gray-600 hover:text-gray-900">|</p>
                        <Link
                            href={route('owners.index')}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Volver al listado
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={owner.name} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Información del Propietario */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Información Personal
                            </h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Nombre completo
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {owner.name}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        DUI
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDui(owner.dui)}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Teléfono
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {owner.phone}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Comunidad
                                    </dt>
                                    <dd className="mt-1">
                                        <CommunityBadge community={owner.community} size="md" />
                                    </dd>
                                </div>

                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        Dirección
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {owner.address}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Estado
                                    </dt>
                                    <dd className="mt-1">
                                        {owner.deleted_at ? (
                                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                                                Inactivo
                                            </span>
                                        ) : (
                                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                                                Activo
                                            </span>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Fecha de registro
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(owner.created_at).toLocaleDateString('es-SV', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Pajas de Agua */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Pajas de Agua ({waterConnectionsCount})
                            </h3>

                            {waterConnectionsCount === 0 ? (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                        Sin pajas de agua
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Este propietario aún no tiene pajas de agua registradas.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            disabled
                                            className="inline-flex items-center rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 shadow-sm cursor-not-allowed"
                                        >
                                            Agregar paja (próximamente)
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    El listado de pajas de agua se mostrará cuando se implemente el módulo correspondiente.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
