<?php

namespace App\Http\Controllers;

use App\Http\Requests\InstallmentPlanRequest;
use App\Http\Requests\InstallmentPlanPaymentRequest;
use App\Models\InstallmentPlan;
use App\Models\InstallmentPlanPayment;
use App\Models\Owner;
use App\Models\SystemSetting;
use App\Models\WaterConnection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InstallmentPlanController extends Controller
{
    /**
     * Mostrar listado de planes de cuotas.
     */
    public function index(Request $request): Response
    {
        $query = InstallmentPlan::with(['waterConnection.owner'])
            ->byCommunity($request->community)
            ->byPlanType($request->plan_type)
            ->byStatus($request->status);

        // Búsqueda por código de paja o nombre de propietario
        if ($request->search) {
            $query->whereHas('waterConnection', function($q) use ($request) {
                $q->search($request->search);
            });
        }

        // Ordenamiento
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        
        if ($sortBy === 'water_connection_code') {
            $query->join('water_connections', 'installment_plans.water_connection_id', '=', 'water_connections.id')
                  ->select('installment_plans.*')
                  ->orderBy('water_connections.code', $sortOrder);
        } elseif ($sortBy === 'community') {
            $query->join('water_connections', 'installment_plans.water_connection_id', '=', 'water_connections.id')
                  ->select('installment_plans.*')
                  ->orderBy('water_connections.community', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $plans = $query->paginate(15)->withQueryString();

        return Inertia::render('InstallmentPlans/Index', [
            'plans' => $plans,
            'filters' => $request->only(['search', 'community', 'plan_type', 'status', 'sort_by', 'sort_order']),
            'communities' => Owner::COMMUNITIES,
            'planTypes' => InstallmentPlan::PLAN_TYPES,
            'statuses' => InstallmentPlan::STATUSES,
            'statusColors' => InstallmentPlan::STATUS_COLORS,
        ]);
    }

    /**
     * Mostrar formulario para crear un nuevo plan.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('InstallmentPlans/Create', [
            'communities' => Owner::COMMUNITIES,
            'planTypes' => InstallmentPlan::PLAN_TYPES,
            'suggestedAmounts' => [
                'installation' => SystemSetting::getInstallmentInstallationAmount(),
                'meter' => SystemSetting::getInstallmentMeterAmount(),
            ],
            'defaultTerm' => SystemSetting::getInstallmentDefaultTerm(),
            'filters' => $request->only(['search', 'community', 'plan_type', 'status']),
            'preselectedWaterConnectionId' => $request->input('water_connection_id'),
        ]);
    }

    /**
     * Almacenar un nuevo plan de cuotas.
     */
    public function store(InstallmentPlanRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        $plan = InstallmentPlan::create($validated);

        // Actualizar el estado de pago de la paja inmediatamente
        $plan->updateWaterConnectionStatus();

        return redirect()
            ->route('installment-plans.show', $plan->id)
            ->with('success', 'Plan de cuotas creado exitosamente.');
    }

    /**
     * Mostrar los detalles de un plan específico.
     */
    public function show(Request $request, InstallmentPlan $installmentPlan): Response
    {
        $installmentPlan->load([
            'waterConnection.owner',
            'payments.user',
            'completedByUser',
            'cancelledByUser'
        ]);

        // Calcular cuotas pendientes
        $paidInstallments = $installmentPlan->payments->pluck('installment_number')->toArray();
        $pendingInstallments = [];
        
        for ($i = 1; $i <= $installmentPlan->installment_count; $i++) {
            if (!in_array($i, $paidInstallments)) {
                $pendingInstallments[] = [
                    'number' => $i,
                    'suggested_amount' => $installmentPlan->installment_amount,
                ];
            }
        }

        return Inertia::render('InstallmentPlans/Show', [
            'plan' => $installmentPlan,
            'pendingInstallments' => $pendingInstallments,
            'filters' => $request->only(['search', 'community', 'plan_type', 'status']),
        ]);
    }

    /**
     * Mostrar formulario para editar un plan.
     */
    public function edit(Request $request, InstallmentPlan $installmentPlan): Response
    {
        $installmentPlan->load('waterConnection.owner');

        return Inertia::render('InstallmentPlans/Edit', [
            'plan' => $installmentPlan,
            'communities' => Owner::COMMUNITIES,
            'planTypes' => InstallmentPlan::PLAN_TYPES,
            'filters' => $request->only(['search', 'community', 'plan_type', 'status']),
        ]);
    }

    /**
     * Actualizar un plan de cuotas.
     */
    public function update(InstallmentPlanRequest $request, InstallmentPlan $installmentPlan): RedirectResponse
    {
        // Solo permitir edición de planes activos
        if ($installmentPlan->status !== 'active') {
            return redirect()
                ->route('installment-plans.show', $installmentPlan->id)
                ->with('error', 'Solo se pueden editar planes activos.');
        }

        $validated = $request->validated();
        $installmentPlan->update($validated);

        // Recalcular estado del plan y de la paja
        $installmentPlan->updatePlanStatus();
        $installmentPlan->updateWaterConnectionStatus();

        return redirect()
            ->route('installment-plans.show', $installmentPlan->id)
            ->with('success', 'Plan de cuotas actualizado exitosamente.');
    }

    /**
     * Eliminar (soft delete) un plan.
     */
    public function destroy(Request $request, InstallmentPlan $installmentPlan): RedirectResponse
    {
        $installmentPlan->delete();

        return redirect()
            ->route('installment-plans.index')
            ->with('success', 'Plan de cuotas eliminado exitosamente.');
    }

    /**
     * Restaurar un plan eliminado.
     */
    public function restore(Request $request, int $id): RedirectResponse
    {
        $installmentPlan = InstallmentPlan::withTrashed()->findOrFail($id);
        $installmentPlan->restore();
        
        // Reactivar si estaba activo
        if ($installmentPlan->status === 'active') {
            $installmentPlan->updateWaterConnectionStatus();
        }

        return redirect()
            ->route('installment-plans.show', $installmentPlan->id)
            ->with('success', 'Plan de cuotas restaurado exitosamente.');
    }

    /**
     * Cancelar un plan.
     */
    public function cancel(Request $request, InstallmentPlan $installmentPlan): RedirectResponse
    {
        $request->validate([
            'cancellation_reason' => 'required|string|max:1000',
        ], [
            'cancellation_reason.required' => 'Debe proporcionar un motivo de cancelación.',
            'cancellation_reason.max' => 'El motivo no puede exceder 1000 caracteres.',
        ]);

        $installmentPlan->cancel($request->cancellation_reason, userId: Auth::id());

        return redirect()
            ->route('installment-plans.show', $installmentPlan->id)
            ->with('success', 'Plan cancelado exitosamente.');
    }

    /**
     * Reactivar un plan cancelado.
     */
    public function reactivate(Request $request, InstallmentPlan $installmentPlan): RedirectResponse
    {
        if ($installmentPlan->status !== 'cancelled') {
            return redirect()
                ->route('installment-plans.show', $installmentPlan->id)
                ->with('error', 'Solo se pueden reactivar planes cancelados.');
        }

        $installmentPlan->reactivate();

        return redirect()
            ->route('installment-plans.show', $installmentPlan->id)
            ->with('success', 'Plan reactivado exitosamente.');
    }

    /**
     * Mostrar formulario para registrar pago de cuota.
     */
    public function createPayment(Request $request, InstallmentPlan $installmentPlan): Response
    {
        if ($installmentPlan->status !== 'active') {
            abort(403, 'Solo se pueden registrar pagos en planes activos.');
        }

        $installmentPlan->load('waterConnection.owner', 'payments');

        // Calcular cuotas pendientes
        $paidInstallments = $installmentPlan->payments->pluck('installment_number')->toArray();
        $pendingInstallments = [];
        
        for ($i = 1; $i <= $installmentPlan->installment_count; $i++) {
            if (!in_array($i, $paidInstallments)) {
                $pendingInstallments[] = [
                    'number' => $i,
                    'suggested_amount' => $installmentPlan->installment_amount,
                ];
            }
        }

        return Inertia::render('InstallmentPlans/PaymentCreate', [
            'plan' => $installmentPlan,
            'pendingInstallments' => $pendingInstallments,
            'filters' => $request->only(['search', 'community', 'plan_type', 'status']),
        ]);
    }

    /**
     * Registrar un pago de cuota.
     */
    public function storePayment(InstallmentPlanPaymentRequest $request, InstallmentPlan $installmentPlan): RedirectResponse
    {
        if ($installmentPlan->status !== 'active') {
            return redirect()
                ->route('installment-plans.show', $installmentPlan->id)
                ->with('error', 'Solo se pueden registrar pagos en planes activos.');
        }

        $validated = $request->validated();
        
        // Asegurar que el payment_date no sea futuro
        $validated['payment_date'] = $validated['payment_date'] ?? now();
        
        // Generar número de recibo
        $validated['receipt_number'] = InstallmentPlanPayment::generateReceiptNumber();
        
        // Asignar usuario actual
        $validated['user_id'] = Auth::id();
        
        // Asegurar que esté asociado al plan correcto
        $validated['installment_plan_id'] = $installmentPlan->id;

        // Crear el pago
        $payment = InstallmentPlanPayment::create($validated);

        // Los eventos del modelo se encargan de actualizar el estado del plan y la paja

        return redirect()
            ->route('installment-plans.payment-receipt', [$installmentPlan->id, $payment->id])
            ->with('success', 'Pago de cuota registrado exitosamente.');
    }

    /**
     * Mostrar comprobante de pago de cuota.
     */
    public function showPaymentReceipt(Request $request, InstallmentPlan $installmentPlan, InstallmentPlanPayment $payment): Response
    {
        // Verificar que el pago pertenezca al plan
        if ($payment->installment_plan_id !== $installmentPlan->id) {
            abort(404);
        }

        $installmentPlan->load('waterConnection.owner');
        $payment->load('user');

        return Inertia::render('InstallmentPlans/PaymentReceipt', [
            'plan' => $installmentPlan,
            'payment' => $payment,
            'filters' => $request->only(['search', 'community', 'plan_type', 'status']),
        ]);
    }

    /**
     * API: Obtener planes activos de una paja de agua específica.
     */
    public function getByConnection(int $waterConnectionId)
    {
        $plans = InstallmentPlan::where('water_connection_id', $waterConnectionId)
            ->with('payments')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'plan_type' => $plan->plan_type,
                    'plan_type_name' => $plan->plan_type_name,
                    'status' => $plan->status,
                    'status_name' => $plan->status_name,
                    'total_amount' => $plan->total_amount,
                    'installment_amount' => $plan->installment_amount,
                    'total_paid' => $plan->total_paid,
                    'balance' => $plan->balance,
                    'installment_count' => $plan->installment_count,
                    'installments_paid_count' => $plan->installments_paid_count,
                    'progress_percentage' => $plan->progress_percentage,
                ];
            });

        return response()->json($plans);
    }

    /**
     * API: Obtener cuotas pendientes de un plan.
     */
    public function getPendingInstallments(InstallmentPlan $installmentPlan)
    {
        $paidInstallments = $installmentPlan->payments->pluck('installment_number')->toArray();
        $pendingInstallments = [];
        
        for ($i = 1; $i <= $installmentPlan->installment_count; $i++) {
            if (!in_array($i, $paidInstallments)) {
                $pendingInstallments[] = [
                    'number' => $i,
                    'suggested_amount' => $installmentPlan->installment_amount,
                ];
            }
        }

        return response()->json([
            'pending_installments' => $pendingInstallments,
            'balance' => $installmentPlan->balance,
        ]);
    }
}
