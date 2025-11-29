<?php

namespace App\Http\Requests;

use App\Models\InstallmentPlan;
use App\Models\InstallmentPlanPayment;
use App\Models\MonthlyPayment;
use App\Models\WaterConnection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UnifiedPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'water_connection_id' => ['required', 'exists:water_connections,id'],
            'payer_name' => ['required', 'string', 'max:255'],
            'payer_dui' => ['required', 'digits:9'],
            'notes' => ['nullable', 'string', 'max:1000'],
            
            // Items del pago
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', 'in:monthly,installment,other'],
            
            // Validaciones para pagos mensuales
            'items.*.selected_months' => ['required_if:items.*.type,monthly', 'array'],
            'items.*.selected_months.*' => ['string', 'regex:/^\d{4}-\d{1,2}$/'],
            'items.*.monthly_fee_amount' => ['required_if:items.*.type,monthly', 'numeric', 'min:0', 'max:9999999.99'],
            
            // Validaciones para cuotas
            'items.*.installment_plan_id' => ['required_if:items.*.type,installment', 'exists:installment_plans,id'],
            'items.*.installment_numbers' => ['required_if:items.*.type,installment', 'array'],
            'items.*.installment_numbers.*' => ['integer', 'min:1'],
            'items.*.amount_per_installment' => ['required_if:items.*.type,installment', 'numeric', 'min:0.01', 'max:9999999.99'],
            
            // Validaciones para otros pagos
            'items.*.payment_type' => ['required_if:items.*.type,other', 'string'],
            'items.*.description' => ['nullable', 'string', 'max:255'],
            'items.*.amount' => ['required_if:items.*.type,other', 'numeric', 'min:0.01', 'max:9999999.99'],
            'items.*.additional_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Configurar validaciones adicionales.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            // Verificar que la paja de agua esté activa
            $waterConnectionId = $this->input('water_connection_id');
            if ($waterConnectionId) {
                $waterConnection = WaterConnection::find($waterConnectionId);
                if ($waterConnection && $waterConnection->status !== 'activa') {
                    $validator->errors()->add(
                        'water_connection_id',
                        'La paja de agua debe estar activa para realizar pagos.'
                    );
                }
            }

            // Validar items según su tipo
            $items = $this->input('items', []);
            foreach ($items as $index => $item) {
                $type = $item['type'] ?? null;

                if ($type === 'monthly') {
                    $this->validateMonthlyPaymentItem($validator, $item, $index);
                } elseif ($type === 'installment') {
                    $this->validateInstallmentItem($validator, $item, $index);
                }
            }
        });
    }

    /**
     * Validar item de pago mensual.
     */
    protected function validateMonthlyPaymentItem(Validator $validator, array $item, int $index): void
    {
        $selectedMonths = $item['selected_months'] ?? [];
        
        // Verificar que no haya meses duplicados
        if (count($selectedMonths) !== count(array_unique($selectedMonths))) {
            $validator->errors()->add(
                "items.{$index}.selected_months",
                'No se pueden seleccionar meses duplicados.'
            );
        }

        // Verificar que no sean más de 12 meses en el futuro
        $currentDate = now();
        foreach ($selectedMonths as $monthIndex => $monthYear) {
            if (preg_match('/^(\d{4})-(\d{1,2})$/', $monthYear, $matches)) {
                $year = (int) $matches[1];
                $month = (int) $matches[2];
                $paymentDate = \Carbon\Carbon::create($year, $month, 1);
                
                if ($paymentDate->diffInMonths($currentDate, false) < -12) {
                    $validator->errors()->add(
                        "items.{$index}.selected_months.{$monthIndex}",
                        'No se pueden pagar meses con más de 12 meses de anticipación.'
                    );
                }
            }
        }
    }

    /**
     * Validar item de cuota.
     */
    protected function validateInstallmentItem(Validator $validator, array $item, int $index): void
    {
        $planId = $item['installment_plan_id'] ?? null;
        $installmentNumbers = $item['installment_numbers'] ?? [];

        if (!$planId) {
            return;
        }

        $plan = InstallmentPlan::find($planId);
        if (!$plan) {
            $validator->errors()->add(
                "items.{$index}.installment_plan_id",
                'El plan de cuotas no existe.'
            );
            return;
        }

        // Verificar que el plan esté activo
        if ($plan->status !== 'active') {
            $validator->errors()->add(
                "items.{$index}.installment_plan_id",
                'Solo se pueden pagar cuotas de planes activos.'
            );
        }

        // Verificar que las cuotas no excedan el total del plan
        foreach ($installmentNumbers as $numIndex => $installmentNumber) {
            if ($installmentNumber > $plan->installment_count) {
                $validator->errors()->add(
                    "items.{$index}.installment_numbers.{$numIndex}",
                    "La cuota {$installmentNumber} excede el total de cuotas del plan ({$plan->installment_count})."
                );
            }

            // Verificar que la cuota no haya sido pagada previamente
            $existingPayment = InstallmentPlanPayment::where('installment_plan_id', $planId)
                ->where('installment_number', $installmentNumber)
                ->first();

            if ($existingPayment) {
                $validator->errors()->add(
                    "items.{$index}.installment_numbers.{$numIndex}",
                    "La cuota {$installmentNumber} ya ha sido pagada anteriormente (recibo #{$existingPayment->receipt_number})."
                );
            }
        }
    }

    /**
     * Mensajes de validación personalizados.
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Debe agregar al menos un concepto de pago.',
            'items.min' => 'Debe agregar al menos un concepto de pago.',
            'payer_dui.digits' => 'El DUI debe tener exactamente 9 dígitos.',
            'payment_date.before_or_equal' => 'La fecha de pago no puede ser futura.',
        ];
    }
}
