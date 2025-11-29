import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import WaterConnectionSearchDropdown from '@/Components/WaterConnectionSearchDropdown';
import MultiMonthSelector from '@/Components/MultiMonthSelector';
import InstallmentSelector from '@/Components/InstallmentSelector';
import InstallmentProgressBar from '@/Components/InstallmentProgressBar';
import DuiInput from '@/Components/DuiInput';

export default function Create({ auth, monthlyFee, currentMonth, currentYear }) {
    const { data, setData, post, processing, errors } = useForm({
        water_connection_id: '',
        payer_name: '',
        payer_dui: '',
        notes: '',
        items: [],
    });

    const [selectedConnection, setSelectedConnection] = useState(null);
    const [activeTab, setActiveTab] = useState('monthly');
    const [currentCart, setCurrentCart] = useState([]);
    const [monthsInCart, setMonthsInCart] = useState([]);
    const [installmentsInCart, setInstallmentsInCart] = useState([]); // [{plan_id, installment_number}, ...]

    // Estado temporal para cada tipo de pago
    const [monthlyData, setMonthlyData] = useState({
        selected_months: [],
        monthly_fee_amount: monthlyFee,
    });

    const [installmentData, setInstallmentData] = useState({
        installment_plan_id: '',
        installment_plan: null,
        installment_numbers: [],
        amount_per_installment: 0,
    });

    const [otherData, setOtherData] = useState({
        payment_type: '',
        amount: 0,
        additional_notes: '',
    });

    const [availablePlans, setAvailablePlans] = useState([]);
    const [pendingInstallments, setPendingInstallments] = useState([]);

    // Cargar planes cuando se seleccione una paja
    useEffect(() => {
        if (selectedConnection) {
            axios.get(`/api/installment-plans/by-connection/${selectedConnection.id}`)
                .then(response => {
                    const activePlans = response.data.filter(plan => plan.status === 'active');
                    setAvailablePlans(activePlans);
                })
                .catch(error => {
                    console.error('Error al cargar planes:', error);
                    setAvailablePlans([]);
                });
        }
    }, [selectedConnection]);

    // Cargar SOLO la próxima cuota a pagar cuando se seleccione un plan
    useEffect(() => {
        if (installmentData.installment_plan_id) {
            axios.get(`/api/installment-plans/${installmentData.installment_plan_id}/pending-installments`)
                .then(response => {
                    // El endpoint devuelve {pending_installments: [], balance: 0}
                    const installments = response.data.pending_installments || response.data;
                    const installmentsArray = Array.isArray(installments) ? installments : [];
                    
                    // Mostrar SOLO la primera cuota pendiente (la próxima a pagar)
                    const nextInstallment = installmentsArray.length > 0 ? [installmentsArray[0]] : [];
                    setPendingInstallments(nextInstallment);
                })
                .catch(error => {
                    console.error('Error al cargar cuotas:', error);
                    setPendingInstallments([]);
                });
        } else {
            setPendingInstallments([]);
        }
    }, [installmentData.installment_plan_id]);

    const handleConnectionSelect = (connection) => {
        setSelectedConnection(connection);
        setData('water_connection_id', connection.id);

        // Auto-rellenar datos del pagador
        if (connection.owner) {
            setData(prev => ({
                ...prev,
                payer_name: connection.owner.name,
                payer_dui: connection.owner.dui || '',
            }));
        }
    };

    // Función estable para manejar cambios de selección de meses
    const handleMonthSelectionChange = useCallback((months) => {
        setMonthlyData(prev => ({
            ...prev,
            selected_months: months
        }));
    }, []);

    // Función estable para manejar cambios de selección de cuotas
    const handleInstallmentSelectionChange = useCallback((numbers) => {
        setInstallmentData(prev => ({
            ...prev,
            installment_numbers: numbers
        }));
    }, []);

    const handleAddToCart = () => {
        let newItem = null;
        let shouldUpdate = false;
        let indexToUpdate = -1;

        if (activeTab === 'monthly') {
            if (monthlyData.selected_months.length === 0) {
                alert('Debe seleccionar al menos un mes');
                return;
            }

            if (monthlyData.monthly_fee_amount <= 0) {
                alert('La cuota mensual debe ser mayor a cero');
                return;
            }

            // Validar que no se agreguen meses duplicados
            const duplicateMonths = monthlyData.selected_months.filter(month => monthsInCart.includes(month));
            if (duplicateMonths.length > 0) {
                alert('Algunos meses seleccionados ya están en el carrito');
                return;
            }

            // Buscar si ya existe un item de tipo 'monthly' en el carrito
            const existingMonthlyIndex = currentCart.findIndex(item => item.type === 'monthly');

            if (existingMonthlyIndex !== -1) {
                // CONSOLIDAR: Agregar los nuevos meses al item existente
                const existingItem = currentCart[existingMonthlyIndex];
                const combinedMonths = [...existingItem.selected_months, ...monthlyData.selected_months];

                // Crear descripción actualizada
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const periods = combinedMonths.map(m => {
                    const [year, month] = m.split('-');
                    return `${monthNames[parseInt(month) - 1]}/${year}`;
                }).join(', ');

                newItem = {
                    type: 'monthly',
                    selected_months: combinedMonths,
                    monthly_fee_amount: monthlyData.monthly_fee_amount,
                    description: periods,
                    total: monthlyData.monthly_fee_amount * combinedMonths.length,
                };

                shouldUpdate = true;
                indexToUpdate = existingMonthlyIndex;
            } else {
                // Crear nuevo item
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const periods = monthlyData.selected_months.map(m => {
                    const [year, month] = m.split('-');
                    return `${monthNames[parseInt(month) - 1]}/${year}`;
                }).join(', ');

                newItem = {
                    type: 'monthly',
                    ...monthlyData,
                    description: periods,
                    total: monthlyData.monthly_fee_amount * monthlyData.selected_months.length,
                };
            }

            // Agregar meses al tracking
            setMonthsInCart([...monthsInCart, ...monthlyData.selected_months]);

        } else if (activeTab === 'installment') {
            if (!installmentData.installment_plan_id || installmentData.installment_numbers.length === 0) {
                alert('Debe seleccionar un plan y al menos una cuota');
                return;
            }

            // Validar que no haya una cuota del MISMO PLAN ya en el carrito
            const existingPlanInCart = currentCart.find(
                item => item.type === 'installment' && item.installment_plan_id === installmentData.installment_plan_id
            );

            if (existingPlanInCart) {
                alert('Ya hay una cuota de este plan en el carrito. Solo puede agregar una cuota por plan por ticket.');
                return;
            }

            // Validar que solo se seleccione UNA cuota a la vez
            if (installmentData.installment_numbers.length > 1) {
                alert('Solo puede seleccionar una cuota a la vez');
                return;
            }

            const plan = installmentData.installment_plan || availablePlans.find(p => p.id === installmentData.installment_plan_id);

            if (!plan) {
                alert('Error: No se pudo encontrar la información del plan');
                return;
            }

            // Usar el monto del input (puede ser modificado por el usuario)
            const amountPerInstallment = installmentData.amount_per_installment || plan.installment_amount;

            // Validar que el monto sea mayor a 0
            if (amountPerInstallment <= 0) {
                alert('El monto pagado debe ser mayor a cero');
                return;
            }

            const currentInstallmentNumber = installmentData.installment_numbers[0];

            // Crear nuevo item (una cuota por plan, permite múltiples planes)
            const totalAmount = parseFloat(amountPerInstallment) || 0;
            const cuotasDesc = `#${currentInstallmentNumber}`;

            newItem = {
                type: 'installment',
                installment_plan_id: installmentData.installment_plan_id,
                installment_plan: plan,
                installment_numbers: [currentInstallmentNumber],
                amount_per_installment: totalAmount,
                description: `${plan.plan_type_name} - Cuota ${cuotasDesc}`,
                total: totalAmount,
            };

            // Agregar cuota al tracking con plan_id
            setInstallmentsInCart([...installmentsInCart, {
                plan_id: installmentData.installment_plan_id,
                installment_number: currentInstallmentNumber
            }]);

        } else if (activeTab === 'other') {
            if (!otherData.payment_type || otherData.amount <= 0) {
                alert('Debe completar todos los campos');
                return;
            }

            // Para "otros pagos" SIEMPRE creamos una NUEVA línea (NO consolidar)
            // Esto permite tener múltiples conceptos diferentes: reconexión, traspaso, etc.
            newItem = {
                type: 'other',
                ...otherData,
                description: otherPaymentTypes[otherData.payment_type],
                total: parseFloat(otherData.amount),
            };

            // NO se consolida, shouldUpdate permanece en false
        }

        if (newItem) {
            let updatedCart;

            if (shouldUpdate) {
                // Actualizar item existente
                updatedCart = currentCart.map((item, idx) =>
                    idx === indexToUpdate ? newItem : item
                );
            } else {
                // Agregar nuevo item
                updatedCart = [...currentCart, newItem];
            }

            setCurrentCart(updatedCart);
            setData('items', updatedCart);

            // Limpiar formulario temporal
            if (activeTab === 'monthly') {
                setMonthlyData({ selected_months: [], monthly_fee_amount: monthlyFee });
            } else if (activeTab === 'installment') {
                // Solo limpiar las cuotas seleccionadas, mantener el plan visible
                setInstallmentData(prev => ({
                    ...prev,
                    installment_numbers: [],
                }));
            } else if (activeTab === 'other') {
                setOtherData({
                    payment_type: '',
                    amount: 0,
                    additional_notes: '',
                });
            }
        }
    };

    const handleRemoveFromCart = (index) => {
        const itemToRemove = currentCart[index];

        // Si es un pago mensual, remover los meses del tracking
        if (itemToRemove.type === 'monthly') {
            const monthsToRemove = itemToRemove.selected_months;
            setMonthsInCart(monthsInCart.filter(m => !monthsToRemove.includes(m)));
        }

        // Si es un pago de cuotas, remover las cuotas del tracking
        if (itemToRemove.type === 'installment') {
            setInstallmentsInCart(installmentsInCart.filter(
                item => !(item.plan_id === itemToRemove.installment_plan_id && 
                          itemToRemove.installment_numbers.includes(item.installment_number))
            ));
        }

        const updatedCart = currentCart.filter((_, i) => i !== index);
        setCurrentCart(updatedCart);
        setData('items', updatedCart);
    };

    const calculateTotal = () => {
        return currentCart.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('payments.store'));
    };

    const otherPaymentTypes = {
        'reconexion': 'Reconexión',
        'reparaciones': 'Reparaciones',
        'accesorios': 'Accesorios',
        'traslados_traspasos': 'Traslados/Traspasos',
        'prima_instalacion': 'Prima de Instalación',
        'multas': 'Multas',
        'otros': 'Otros Conceptos',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Punto de Cobro</h2>}
        >
            <Head title="Punto de Cobro" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} noValidate>
                                {/* Búsqueda de paja de agua */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Paja de Agua *
                                    </label>
                                    <WaterConnectionSearchDropdown
                                        onSelect={handleConnectionSelect}
                                        error={errors.water_connection_id}
                                    />
                                    {errors.water_connection_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.water_connection_id}</p>
                                    )}
                                </div>

                                {/* Información de la paja seleccionada */}
                                {selectedConnection && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <h3 className="font-semibold text-blue-900 mb-2">Información de la Paja</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Número:</span> {selectedConnection.owner_number}
                                            </div>
                                            <div>
                                                <span className="font-medium">Propietario:</span> {selectedConnection.owner?.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">Comunidad:</span> {selectedConnection.community}
                                            </div>
                                            <div>
                                                <span className="font-medium">Estado:</span>{' '}
                                                <span className={`px-2 py-1 rounded text-xs ${selectedConnection.status === 'activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {selectedConnection.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Datos del pagador */}
                                {selectedConnection && (
                                    <div className="mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre del Pagador *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.payer_name}
                                                    onChange={e => setData('payer_name', e.target.value)}
                                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <p className="text-xs text-orange-600">
                                                    Los datos se han cargado automáticamente del propietario. Puedes modificarlos si el pago lo realiza otra persona.
                                                </p>
                                                {errors.payer_name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.payer_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    DUI del Pagador *
                                                </label>
                                                <DuiInput
                                                    value={data.payer_dui}
                                                    onChange={(value) => setData('payer_dui', value)}
                                                />
                                                {errors.payer_dui && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.payer_dui}</p>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                )}                                {/* Tabs para tipos de pago */}
                                {selectedConnection && (
                                    <div className="mb-6">
                                        <div className="border-b border-gray-200 mb-4">
                                            <nav className="-mb-px flex space-x-8">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('monthly')}
                                                    className={`${activeTab === 'monthly'
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                >
                                                    Cobro Mensual
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('installment')}
                                                    className={`${activeTab === 'installment'
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                >
                                                    Planes de Cuotas
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('other')}
                                                    className={`${activeTab === 'other'
                                                        ? 'border-indigo-500 text-indigo-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                                >
                                                    Otros Pagos
                                                </button>
                                            </nav>
                                        </div>

                                        {/* Contenido de Cobro Mensual */}
                                        {activeTab === 'monthly' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cuota Mensual
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={monthlyData.monthly_fee_amount}
                                                        onChange={e => {
                                                            const value = parseFloat(e.target.value);
                                                            setMonthlyData(prev => ({
                                                                ...prev,
                                                                monthly_fee_amount: value > 0 ? value : 0.01
                                                            }));
                                                        }}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>

                                                <MultiMonthSelector
                                                    pendingMonths={selectedConnection.pending_months || []}
                                                    monthlyFee={monthlyData.monthly_fee_amount}
                                                    onSelectionChange={handleMonthSelectionChange}
                                                    disabledMonths={monthsInCart}
                                                    selectedMonths={monthlyData.selected_months}
                                                />

                                                <button
                                                    type="button"
                                                    onClick={handleAddToCart}
                                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                >
                                                    Agregar al Carrito
                                                </button>
                                            </div>
                                        )}

                                        {/* Contenido de Planes de Cuotas */}
                                        {activeTab === 'installment' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Seleccionar Plan
                                                    </label>
                                                    <select
                                                        value={installmentData.installment_plan_id}
                                                        onChange={e => {
                                                            const planId = parseInt(e.target.value);
                                                            const plan = availablePlans.find(p => p.id === planId);
                                                            setInstallmentData(prev => ({
                                                                ...prev,
                                                                installment_plan_id: planId || '',
                                                                installment_plan: plan || null,
                                                                amount_per_installment: plan?.installment_amount || 0,
                                                            }));
                                                        }}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="">Seleccione un plan</option>
                                                        {availablePlans.map(plan => (
                                                            <option key={plan.id} value={plan.id}>
                                                                {plan.plan_type_name} - Saldo: ${plan.balance.toFixed(2)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {installmentData.installment_plan_id && installmentData.installment_plan && (
                                                    <>
                                                        {/* Información del Plan */}
                                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                                                {installmentData.installment_plan.plan_type_name}
                                                            </h4>
                                                            <InstallmentProgressBar
                                                                percentage={installmentData.installment_plan.progress_percentage || 0}
                                                                installmentsPaid={installmentData.installment_plan.installments_paid_count || 0}
                                                                installmentsTotal={installmentData.installment_plan.installment_count || 0}
                                                            />
                                                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                                <div>
                                                                    <span className="text-gray-600">Monto por cuota:</span>
                                                                    <p className="font-semibold text-gray-900">
                                                                        ${parseFloat(installmentData.installment_plan.installment_amount || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-600">Saldo pendiente:</span>
                                                                    <p className="font-semibold text-orange-600">
                                                                        ${parseFloat(installmentData.installment_plan.balance || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Verificar si ya hay una cuota en el carrito */}
                                                        {currentCart.find(item => item.type === 'installment' && item.installment_plan_id === installmentData.installment_plan_id) ? (
                                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                                <p className="text-sm text-orange-800">
                                                                    ⚠️ Ya hay una cuota de este plan en el carrito. Solo puede agregar una cuota por plan.
                                                                    Puede agregar cuotas de otros planes diferentes (ej: instalación + medidor).
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <InstallmentSelector
                                                                    pendingInstallments={pendingInstallments}
                                                                    onSelectionChange={handleInstallmentSelectionChange}
                                                                    disabledInstallments={installmentsInCart
                                                                        .filter(item => item.plan_id === installmentData.installment_plan_id)
                                                                        .map(item => item.installment_number)
                                                                    }
                                                                    selectedInstallments={installmentData.installment_numbers}
                                                                />

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Monto Pagado *
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0.01"
                                                                        value={installmentData.amount_per_installment}
                                                                        onChange={e => {
                                                                            const value = parseFloat(e.target.value);
                                                                            setInstallmentData(prev => ({
                                                                                ...prev,
                                                                                amount_per_installment: value > 0 ? value : 0.01
                                                                            }));
                                                                        }}
                                                                        onWheel={(e) => e.target.blur()}
                                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                                    />
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        Puede modificar el monto si el pago es parcial o incluye un adelanto
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={handleAddToCart}
                                                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                                >
                                                                    Agregar al Carrito
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Contenido de Otros Pagos */}
                                        {activeTab === 'other' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tipo de Pago
                                                    </label>
                                                    <select
                                                        value={otherData.payment_type}
                                                        onChange={e => setOtherData(prev => ({
                                                            ...prev,
                                                            payment_type: e.target.value
                                                        }))}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="">Seleccione un tipo</option>
                                                        {Object.entries(otherPaymentTypes).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Monto
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={otherData.amount}
                                                        onChange={e => setOtherData(prev => ({
                                                            ...prev,
                                                            amount: parseFloat(e.target.value) || 0
                                                        }))}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Notas Adicionales
                                                    </label>
                                                    <textarea
                                                        value={otherData.additional_notes}
                                                        onChange={e => setOtherData(prev => ({
                                                            ...prev,
                                                            additional_notes: e.target.value
                                                        }))}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        rows={3}
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleAddToCart}
                                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                >
                                                    Agregar al Carrito
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Carrito de pagos */}
                                {currentCart.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-4">Conceptos a Pagar</h3>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {currentCart.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`px-2 py-1 rounded text-xs ${item.type === 'monthly' ? 'bg-blue-100 text-blue-800' :
                                                                    item.type === 'installment' ? 'bg-green-100 text-green-800' :
                                                                        'bg-purple-100 text-purple-800'
                                                                    }`}>
                                                                    {item.type === 'monthly' ? 'Cuota mensual' :
                                                                        item.type === 'installment' ? 'Cuota' : 'Otro'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                                ${(parseFloat(item.total) || 0).toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveFromCart(index)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-gray-50">
                                                        <td colSpan="2" className="px-4 py-3 text-right font-bold text-gray-900">TOTAL:</td>
                                                        <td className="px-4 py-3 text-right font-bold text-lg text-indigo-600">
                                                            ${calculateTotal().toFixed(2)}
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Notas generales */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas del Pago
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={3}
                                        disabled={!selectedConnection}
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || currentCart.length === 0}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                                    >
                                        {processing ? 'Procesando...' : 'Registrar Pago'}
                                    </button>
                                </div>

                                {errors.items && (
                                    <p className="mt-4 text-sm text-red-600 text-center">{errors.items}</p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
