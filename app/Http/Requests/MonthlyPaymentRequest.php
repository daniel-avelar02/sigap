<?php

namespace App\Http\Requests;

use App\Models\MonthlyPayment;
use App\Models\WaterConnection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MonthlyPaymentRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtener las reglas de validación que aplican a la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentYear = date('Y');
        $currentMonth = date('n');

        return [
            'water_connection_id' => [
                'required',
                'exists:water_connections,id',
                function ($attribute, $value, $fail) {
                    $connection = WaterConnection::find($value);
                    if ($connection && $connection->status !== 'activa') {
                        $fail('La paja de agua debe estar activa para registrar pagos.');
                    }
                },
            ],
            'selected_months' => [
                'required',
                'array',
                'min:1',
            ],
            'selected_months.*' => [
                'required',
                'string',
                'regex:/^\d{4}-\d{1,2}$/', // Formato: YYYY-M o YYYY-MM
            ],
            'payment_date' => [
                'nullable',
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
            'monthly_fee_amount' => [
                'required',
                'numeric',
                'min:0',
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
     * Validación adicional después de las reglas básicas.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->water_connection_id && $this->selected_months) {
                $currentYear = date('Y');
                $currentMonth = date('n');
                
                foreach ($this->selected_months as $index => $monthYear) {
                    // Parsear el formato YYYY-M
                    [$year, $month] = explode('-', $monthYear);
                    $year = (int) $year;
                    $month = (int) $month;
                    
                    // Validar que no sea un mes futuro
                    if ($year > $currentYear || 
                        ($year == $currentYear && $month > $currentMonth)) {
                        $validator->errors()->add(
                            "selected_months.{$index}",
                            'No se puede registrar un pago para un mes futuro.'
                        );
                        continue;
                    }
                    
                    // Verificar que no exista un pago duplicado
                    $exists = MonthlyPayment::where('water_connection_id', $this->water_connection_id)
                        ->where('payment_month', $month)
                        ->where('payment_year', $year)
                        ->exists();

                    if ($exists) {
                        $months = [
                            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre',
                        ];
                        
                        $validator->errors()->add(
                            "selected_months.{$index}",
                            "Ya existe un pago registrado para {$months[$month]} {$year}."
                        );
                    }
                }
            }
        });
    }

    /**
     * Obtener los nombres de los atributos personalizados para los errores de validación.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'water_connection_id' => 'paja de agua',
            'selected_months' => 'meses seleccionados',
            'payment_date' => 'fecha de pago',
            'payer_name' => 'nombre del pagador',
            'payer_dui' => 'DUI del pagador',
            'monthly_fee_amount' => 'monto de la cuota',
            'notes' => 'observaciones',
        ];
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
            'selected_months.required' => 'Debe seleccionar al menos un mes para pagar.',
            'selected_months.min' => 'Debe seleccionar al menos un mes para pagar.',
            'payer_name.required' => 'El nombre del pagador es obligatorio.',
            'payer_dui.required' => 'El DUI del pagador es obligatorio.',
            'payer_dui.digits' => 'El DUI debe contener exactamente 9 dígitos.',
            'monthly_fee_amount.required' => 'El monto de la cuota es obligatorio.',
            'monthly_fee_amount.numeric' => 'El monto debe ser un número válido.',
            'monthly_fee_amount.min' => 'El monto debe ser mayor o igual a 0.',
            'payment_date.before_or_equal' => 'La fecha de pago no puede ser futura.',
        ];
    }
}
