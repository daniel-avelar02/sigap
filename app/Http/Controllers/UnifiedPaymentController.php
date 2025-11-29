<?php

namespace App\Http\Controllers;

use App\Http\Requests\UnifiedPaymentRequest;
use App\Models\InstallmentPlan;
use App\Models\InstallmentPlanPayment;
use App\Models\MonthlyPayment;
use App\Models\OtherPayment;
use App\Models\Payment;
use App\Models\PaymentItem;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UnifiedPaymentController extends Controller
{
    /**
     * Mostrar el formulario de pago unificado.
     */
    public function create(Request $request): Response
    {
        $systemSetting = SystemSetting::first();
        
        return Inertia::render('UnifiedPayments/Create', [
            'monthlyFee' => $systemSetting?->monthly_fee ?? 0,
            'currentMonth' => now()->month,
            'currentYear' => now()->year,
        ]);
    }

    /**
     * Procesar el pago unificado.
     */
    public function store(UnifiedPaymentRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            // Generar número de recibo único para todo el pago
            $receiptNumber = Payment::generateReceiptNumber();
            
            $totalAmount = 0;
            $createdPayments = [];

            // Procesar cada item del pago
            foreach ($request->input('items', []) as $item) {
                $itemType = $item['type'];
                
                if ($itemType === 'monthly') {
                    $result = $this->processMonthlyPaymentItem($item, $request, $receiptNumber);
                    $totalAmount += $result['total'];
                    $createdPayments = array_merge($createdPayments, $result['payments']);
                } elseif ($itemType === 'installment') {
                    $result = $this->processInstallmentItem($item, $request, $receiptNumber);
                    $totalAmount += $result['total'];
                    $createdPayments = array_merge($createdPayments, $result['payments']);
                } elseif ($itemType === 'other') {
                    $result = $this->processOtherPaymentItem($item, $request, $receiptNumber);
                    $totalAmount += $result['total'];
                    $createdPayments[] = $result['payment'];
                }
            }

            // Crear el registro principal de Payment
            $payment = Payment::create([
                'water_connection_id' => $request->input('water_connection_id'),
                'receipt_number' => $receiptNumber,
                'total_amount' => $totalAmount,
                'payer_name' => $request->input('payer_name'),
                'payer_dui' => $request->input('payer_dui'),
                'payment_date' => now(),
                'notes' => $request->input('notes'),
                'user_id' => Auth::id(),
            ]);

            // Crear los PaymentItems que relacionan el Payment con los pagos individuales
            foreach ($createdPayments as $createdPayment) {
                PaymentItem::create([
                    'payment_id' => $payment->id,
                    'item_type' => $createdPayment['type'],
                    'monthly_payment_id' => $createdPayment['monthly_payment_id'] ?? null,
                    'installment_plan_payment_id' => $createdPayment['installment_plan_payment_id'] ?? null,
                    'other_payment_id' => $createdPayment['other_payment_id'] ?? null,
                    'amount' => $createdPayment['amount'],
                    'description' => $createdPayment['description'],
                ]);
            }

            // Actualizar estado de la paja de agua
            $waterConnection = $payment->waterConnection;
            $waterConnection->updatePaymentStatus();

            DB::commit();

            return redirect()
                ->route('payments.show', $payment)
                ->with('success', 'Pago registrado exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Error al procesar el pago: ' . $e->getMessage());
        }
    }

    /**
     * Procesar un item de pago mensual.
     */
    protected function processMonthlyPaymentItem(array $item, UnifiedPaymentRequest $request, string $receiptNumber): array
    {
        $selectedMonths = $item['selected_months'] ?? [];
        $monthlyFeeAmount = $item['monthly_fee_amount'];
        $monthsCount = count($selectedMonths);
        $totalAmount = $monthlyFeeAmount * $monthsCount;
        
        $payments = [];
        $paymentGroupId = null;

        // Si son múltiples meses, generar un ID de grupo
        if ($monthsCount > 1) {
            $paymentGroupId = MonthlyPayment::generatePaymentGroupId();
        }

        // Convertir selected_months a formato [{month: 1, year: 2025}, ...]
        $monthsPaid = [];
        foreach ($selectedMonths as $monthYear) {
            if (preg_match('/^(\d{4})-(\d{1,2})$/', $monthYear, $matches)) {
                $monthsPaid[] = [
                    'month' => (int) $matches[2],
                    'year' => (int) $matches[1],
                ];
            }
        }

        // Si es un solo mes, usar los campos legacy
        $paymentMonth = null;
        $paymentYear = null;
        if ($monthsCount === 1 && !empty($monthsPaid)) {
            $paymentMonth = $monthsPaid[0]['month'];
            $paymentYear = $monthsPaid[0]['year'];
        }

        // Crear el pago mensual
        $monthlyPayment = MonthlyPayment::create([
            'water_connection_id' => $request->input('water_connection_id'),
            'payment_month' => $paymentMonth,
            'payment_year' => $paymentYear,
            'months_paid' => $monthsPaid,
            'payment_date' => $request->input('payment_date') ?? now(),
            'receipt_number' => $receiptNumber,
            'payment_group_id' => $paymentGroupId,
            'months_count' => $monthsCount,
            'payer_name' => $request->input('payer_name'),
            'payer_dui' => $request->input('payer_dui'),
            'monthly_fee_amount' => $monthlyFeeAmount,
            'total_amount' => $totalAmount,
            'notes' => $request->input('notes'),
            'user_id' => Auth::id(),
        ]);

        $payments[] = [
            'type' => 'monthly',
            'monthly_payment_id' => $monthlyPayment->id,
            'amount' => $totalAmount,
            'description' => $monthsCount > 1 
                ? "Pago mensual ({$monthsCount} meses)" 
                : "Pago mensual",
        ];

        return [
            'total' => $totalAmount,
            'payments' => $payments,
        ];
    }

    /**
     * Procesar un item de cuota.
     */
    protected function processInstallmentItem(array $item, UnifiedPaymentRequest $request, string $receiptNumber): array
    {
        $planId = $item['installment_plan_id'];
        $installmentNumbers = $item['installment_numbers'] ?? [];
        $amountPerInstallment = $item['amount_per_installment'];
        
        $plan = InstallmentPlan::findOrFail($planId);
        $payments = [];
        $totalAmount = 0;

        foreach ($installmentNumbers as $installmentNumber) {
            $installmentPayment = InstallmentPlanPayment::create([
                'installment_plan_id' => $planId,
                'installment_number' => $installmentNumber,
                'payment_date' => $request->input('payment_date') ?? now(),
                'receipt_number' => $receiptNumber,
                'payer_name' => $request->input('payer_name'),
                'payer_dui' => $request->input('payer_dui'),
                'amount_paid' => $amountPerInstallment,
                'notes' => $request->input('notes'),
                'user_id' => Auth::id(),
            ]);

            $payments[] = [
                'type' => 'installment',
                'installment_plan_payment_id' => $installmentPayment->id,
                'amount' => $amountPerInstallment,
                'description' => "Cuota #{$installmentNumber} - {$plan->plan_type_name}",
            ];

            $totalAmount += $amountPerInstallment;
        }

        // Actualizar estado del plan
        $plan->updatePlanStatus(Auth::id());
        $plan->updateWaterConnectionStatus();

        return [
            'total' => $totalAmount,
            'payments' => $payments,
        ];
    }

    /**
     * Procesar un item de otro pago.
     */
    protected function processOtherPaymentItem(array $item, UnifiedPaymentRequest $request, string $receiptNumber): array
    {
        $amount = $item['amount'];
        
        $otherPayment = OtherPayment::create([
            'water_connection_id' => $request->input('water_connection_id'),
            'payment_type' => $item['payment_type'],
            'description' => $item['description'],
            'amount' => $amount,
            'payer_name' => $request->input('payer_name'),
            'payer_dui' => $request->input('payer_dui'),
            'additional_notes' => $item['additional_notes'] ?? null,
            'receipt_number' => $receiptNumber,
            'payment_date' => $request->input('payment_date') ?? now(),
            'user_id' => Auth::id(),
        ]);

        return [
            'total' => $amount,
            'payment' => [
                'type' => 'other',
                'other_payment_id' => $otherPayment->id,
                'amount' => $amount,
                'description' => $item['description'],
            ],
        ];
    }

    /**
     * Mostrar el comprobante de pago unificado.
     */
    public function show(Request $request, Payment $payment): Response
    {
        $payment->load([
            'waterConnection.owner',
            'paymentItems.monthlyPayment',
            'paymentItems.installmentPlanPayment.installmentPlan',
            'paymentItems.otherPayment',
            'user',
        ]);

        return Inertia::render('UnifiedPayments/Receipt', [
            'payment' => $payment,
        ]);
    }
}
