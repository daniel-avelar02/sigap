<?php

namespace App\Http\Requests;

use App\Models\InstallmentPlan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InstallmentPlanRequest extends FormRequest
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
        $installmentPlanId = $this->route('installment_plan');
        $waterConnectionId = $this->input('water_connection_id');
        $planType = $this->input('plan_type');

        return [
            'water_connection_id' => [
                'required',
                'exists:water_connections,id',
                // Validar que la paja esté activa
                function ($attribute, $value, $fail) {
                    $waterConnection = \App\Models\WaterConnection::find($value);
                    if ($waterConnection && $waterConnection->status !== 'activa') {
                        $fail('La paja de agua debe estar activa para crear un plan de cuotas.');
                    }
                },
            ],
            'plan_type' => [
                'required',
                Rule::in(['installation', 'meter']),
            ],
            'total_amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:9999999.99',
            ],
            'installment_count' => [
                'required',
                'integer',
                'min:1',
                'max:60', // Máximo 60 cuotas (5 años)
            ],
            'installment_amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:9999999.99',
            ],
            'start_date' => [
                'required',
                'date',
                'before_or_equal:' . now()->addYears(1)->format('Y-m-d'),
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
            $waterConnectionId = $this->input('water_connection_id');
            $planType = $this->input('plan_type');
            $installmentPlanId = $this->route('installment_plan');

            // Validar que no exista otro plan activo del mismo tipo para esta paja
            if ($waterConnectionId && $planType) {
                $existingPlan = InstallmentPlan::where('water_connection_id', $waterConnectionId)
                    ->where('plan_type', $planType)
                    ->where('status', 'active')
                    ->when($installmentPlanId, function ($query) use ($installmentPlanId) {
                        return $query->where('id', '!=', $installmentPlanId);
                    })
                    ->first();

                if ($existingPlan) {
                    $planTypeName = InstallmentPlan::PLAN_TYPES[$planType] ?? $planType;
                    $validator->errors()->add(
                        'plan_type',
                        "Ya existe un plan activo de {$planTypeName} para esta paja de agua. No se permiten planes duplicados del mismo tipo."
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
            'water_connection_id.required' => 'Debe seleccionar una paja de agua.',
            'water_connection_id.exists' => 'La paja de agua seleccionada no existe.',
            'plan_type.required' => 'Debe seleccionar el tipo de plan.',
            'plan_type.in' => 'El tipo de plan seleccionado no es válido.',
            'total_amount.required' => 'El monto total es obligatorio.',
            'total_amount.numeric' => 'El monto total debe ser un número.',
            'total_amount.min' => 'El monto total debe ser mayor a $0.00.',
            'total_amount.max' => 'El monto total no puede exceder $9,999,999.99.',
            'installment_count.required' => 'El número de cuotas es obligatorio.',
            'installment_count.integer' => 'El número de cuotas debe ser un número entero.',
            'installment_count.min' => 'Debe haber al menos 1 cuota.',
            'installment_count.max' => 'El máximo de cuotas permitidas es 60.',
            'installment_amount.required' => 'El monto por cuota es obligatorio.',
            'installment_amount.numeric' => 'El monto por cuota debe ser un número.',
            'installment_amount.min' => 'El monto por cuota debe ser mayor a $0.00.',
            'installment_amount.max' => 'El monto por cuota no puede exceder $9,999,999.99.',
            'start_date.required' => 'La fecha de inicio es obligatoria.',
            'start_date.date' => 'La fecha de inicio no es válida.',
            'start_date.before_or_equal' => 'La fecha de inicio no puede ser mayor a un año en el futuro.',
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
            'water_connection_id' => 'paja de agua',
            'plan_type' => 'tipo de plan',
            'total_amount' => 'monto total',
            'installment_count' => 'número de cuotas',
            'installment_amount' => 'monto por cuota',
            'start_date' => 'fecha de inicio',
            'notes' => 'notas',
        ];
    }
}
