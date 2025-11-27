<?php

namespace App\Http\Requests;

use App\Models\InstallmentPlanPayment;
use Illuminate\Foundation\Http\FormRequest;

class InstallmentPlanPaymentRequest extends FormRequest
{
    /**
     * Determinar si el usuario está autorizado para realizar esta solicitud.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtener las reglas de validación que se aplican a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'installment_plan_id' => [
                'required',
                'exists:installment_plans,id',
                // Validar que el plan esté activo
                function ($attribute, $value, $fail) {
                    $plan = \App\Models\InstallmentPlan::find($value);
                    if ($plan && $plan->status !== 'active') {
                        $fail('Solo se pueden registrar pagos en planes activos.');
                    }
                },
            ],
            'installment_number' => [
                'required',
                'integer',
                'min:1',
                'max:255',
            ],
            'payment_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],
            'payer_name' => [
                'required',
                'string',
                'max:255',
            ],
            'payer_dui' => [
                'required',
                'digits:9',
            ],
            'amount_paid' => [
                'required',
                'numeric',
                'min:0.01',
                'max:9999999.99',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Configurar el validador.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $installmentPlanId = $this->input('installment_plan_id');
            $installmentNumber = $this->input('installment_number');

            // Validar que esta cuota no haya sido pagada ya
            if ($installmentPlanId && $installmentNumber) {
                $existingPayment = InstallmentPlanPayment::where('installment_plan_id', $installmentPlanId)
                    ->where('installment_number', $installmentNumber)
                    ->first();

                if ($existingPayment) {
                    $validator->errors()->add(
                        'installment_number',
                        "La cuota #{$installmentNumber} ya fue pagada el " . 
                        $existingPayment->payment_date->format('d/m/Y') . 
                        ". No se pueden registrar pagos duplicados."
                    );
                }
            }

            // Validar que el número de cuota no exceda el total de cuotas del plan
            if ($installmentPlanId && $installmentNumber) {
                $plan = \App\Models\InstallmentPlan::find($installmentPlanId);
                if ($plan && $installmentNumber > $plan->installment_count) {
                    $validator->errors()->add(
                        'installment_number',
                        "El número de cuota ({$installmentNumber}) no puede ser mayor que el total de cuotas del plan ({$plan->installment_count})."
                    );
                }
            }
        });
    }

    /**
     * Obtener los mensajes de error personalizados.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'installment_plan_id.required' => 'Debe seleccionar un plan de cuotas.',
            'installment_plan_id.exists' => 'El plan de cuotas seleccionado no existe.',
            'installment_number.required' => 'El número de cuota es obligatorio.',
            'installment_number.integer' => 'El número de cuota debe ser un número entero.',
            'installment_number.min' => 'El número de cuota debe ser al menos 1.',
            'installment_number.max' => 'El número de cuota no puede exceder 255.',
            'payment_date.required' => 'La fecha de pago es obligatoria.',
            'payment_date.date' => 'La fecha de pago no es válida.',
            'payment_date.before_or_equal' => 'La fecha de pago no puede ser futura.',
            'payer_name.required' => 'El nombre del pagador es obligatorio.',
            'payer_name.max' => 'El nombre del pagador no puede exceder 255 caracteres.',
            'payer_dui.required' => 'El DUI del pagador es obligatorio.',
            'payer_dui.digits' => 'El DUI debe tener exactamente 9 dígitos.',
            'amount_paid.required' => 'El monto pagado es obligatorio.',
            'amount_paid.numeric' => 'El monto pagado debe ser un número.',
            'amount_paid.min' => 'El monto pagado debe ser mayor a $0.00.',
            'amount_paid.max' => 'El monto pagado no puede exceder $9,999,999.99.',
            'notes.max' => 'Las notas no pueden exceder 1000 caracteres.',
        ];
    }

    /**
     * Obtener los nombres personalizados de los atributos.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'installment_plan_id' => 'plan de cuotas',
            'installment_number' => 'número de cuota',
            'payment_date' => 'fecha de pago',
            'payer_name' => 'nombre del pagador',
            'payer_dui' => 'DUI del pagador',
            'amount_paid' => 'monto pagado',
            'notes' => 'notas',
        ];
    }
}
