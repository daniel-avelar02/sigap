import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Receipt({ auth, payment }) {
    const handlePrint = () => {
        window.print();
    };

    const getItemTypeBadge = (type) => {
        const types = {
            monthly: { label: 'Pago Mensual', class: 'bg-blue-100 text-blue-800' },
            installment: { label: 'Cuota de Plan', class: 'bg-green-100 text-green-800' },
            other: { label: 'Otro Pago', class: 'bg-purple-100 text-purple-800' },
        };
        return types[type] || { label: type, class: 'bg-gray-100 text-gray-800' };
    };

    const formatDui = (dui) => {
        if (!dui || dui.length !== 9) return dui;
        return `${dui.slice(0, 8)}-${dui.slice(8)}`;
    };

    // Agrupar items por tipo
    const monthlyItems = payment.payment_items.filter(item => item.item_type === 'monthly');
    const installmentItems = payment.payment_items.filter(item => item.item_type === 'installment');
    const otherItems = payment.payment_items.filter(item => item.item_type === 'other');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Comprobante de Pago</h2>}
        >
            <Head title="Comprobante de Pago" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Botón de imprimir (oculto al imprimir) */}
                    <div className="mb-4 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                        >
                            🖨️ Imprimir Comprobante
                        </button>
                    </div>

                    {/* Comprobante */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8">
                        {/* Encabezado del comprobante */}
                        <div className="text-center mb-6 border-b pb-6">
                            <h1 className="text-2xl font-bold text-gray-900">COMPROBANTE DE PAGO</h1>
                            <p className="text-sm text-gray-600 mt-1">Sistema de Gestión de Agua Potable</p>
                            <div className="mt-4">
                                <p className="text-lg font-semibold">
                                    Recibo N° <span className="text-indigo-600">{payment.receipt_number}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Fecha: {new Date(payment.payment_date).toLocaleDateString('es-SV', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Información de la paja de agua */}
                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Paja de Agua</h3>
                                <p className="text-sm"><strong>Código:</strong> {payment.water_connection.code}</p>
                                <p className="text-sm"><strong>Número:</strong> {payment.water_connection.owner_number}</p>
                                <p className="text-sm"><strong>Comunidad:</strong> {payment.water_connection.community}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Propietario</h3>
                                <p className="text-sm"><strong>Nombre:</strong> {payment.water_connection.owner?.name}</p>
                                {payment.water_connection.owner?.dui && (
                                    <p className="text-sm"><strong>DUI:</strong> {formatDui(payment.water_connection.owner.dui)}</p>
                                )}
                            </div>
                        </div>

                        {/* Información del pagador */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">Datos del Pagador</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <p className="text-sm"><strong>Nombre:</strong> {payment.payer_name}</p>
                                <p className="text-sm"><strong>DUI:</strong> {formatDui(payment.payer_dui)}</p>
                            </div>
                        </div>

                        {/* Desglose de pagos */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Detalle de Pagos</h3>

                            {/* Pagos Mensuales */}
                            {monthlyItems.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-2">
                                            PAGOS MENSUALES
                                        </span>
                                    </h4>
                                    <table className="min-w-full border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthlyItems.map((item, index) => {
                                                const monthlyPayment = item.monthly_payment;
                                                return (
                                                    <tr key={index} className="border-t">
                                                        <td className="px-4 py-2 text-sm">
                                                            {item.description}
                                                            {monthlyPayment?.months_paid && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Meses: {monthlyPayment.months_paid.map(m => 
                                                                        `${m.month}/${m.year}`
                                                                    ).join(', ')}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-right font-medium">
                                                            ${parseFloat(item.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Cuotas de Planes */}
                            {installmentItems.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-2">
                                            CUOTAS DE PLANES
                                        </span>
                                    </h4>
                                    <table className="min-w-full border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {installmentItems.map((item, index) => {
                                                const installmentPayment = item.installment_plan_payment;
                                                return (
                                                    <tr key={index} className="border-t">
                                                        <td className="px-4 py-2 text-sm">
                                                            {item.description}
                                                            {installmentPayment?.installment_plan && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Progreso: {installmentPayment.installment_plan.installments_paid_count}/{installmentPayment.installment_plan.installment_count} cuotas
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-right font-medium">
                                                            ${parseFloat(item.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Otros Pagos */}
                            {otherItems.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs mr-2">
                                            OTROS PAGOS
                                        </span>
                                    </h4>
                                    <table className="min-w-full border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {otherItems.map((item, index) => {
                                                const otherPayment = item.other_payment;
                                                return (
                                                    <tr key={index} className="border-t">
                                                        <td className="px-4 py-2 text-sm">
                                                            {item.description}
                                                            {otherPayment?.payment_type && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Tipo: {otherPayment.payment_type}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-right font-medium">
                                                            ${parseFloat(item.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="border-t-2 border-gray-300 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900">TOTAL PAGADO:</span>
                                <span className="text-3xl font-bold text-indigo-600">
                                    ${parseFloat(payment.total_amount).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Notas */}
                        {payment.notes && (
                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-sm font-semibold text-yellow-900 mb-1">Notas:</p>
                                <p className="text-sm text-yellow-800">{payment.notes}</p>
                            </div>
                        )}

                        {/* Pie del comprobante */}
                        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
                            <p>Recibido por: {payment.user?.name}</p>
                            <p className="mt-2">Este comprobante es válido como recibo de pago</p>
                            <p className="mt-4 text-gray-400">
                                Generado el {new Date(payment.created_at).toLocaleString('es-SV')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
