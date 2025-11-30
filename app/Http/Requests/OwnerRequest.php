<?php

namespace App\Http\Requests;

use App\Models\Owner;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OwnerRequest extends FormRequest
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
        $ownerId = $this->route('owner');
        $ownerType = $this->input('owner_type', 'natural');

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'owner_type' => ['required', 'string', Rule::in(['natural', 'organization'])],
            'phone' => ['nullable', 'digits:8'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'community' => ['required', 'string', Rule::in(Owner::COMMUNITIES)],
        ];

        // Validación condicional según el tipo de propietario
        if ($ownerType === 'natural') {
            // Persona natural: DUI opcional
            $rules['dui'] = [
                'nullable',
                'digits:9',
                Rule::unique('owners', 'dui')->ignore($ownerId)->whereNotNull('dui'),
            ];
            $rules['tax_id'] = ['nullable'];
        } else {
            // Organización: NIT opcional
            $rules['dui'] = ['nullable'];
            $rules['tax_id'] = [
                'nullable',
                'string',
                'regex:/^\d{4}-?\d{6}-?\d{3}-?\d{1}$/',
                Rule::unique('owners', 'tax_id')->ignore($ownerId)->whereNotNull('tax_id'),
            ];
        }

        return $rules;
    }

    /**
     * Obtenga atributos personalizados para errores del validador.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'owner_type' => 'tipo de propietario',
            'dui' => 'DUI',
            'tax_id' => 'NIT',
            'phone' => 'teléfono',
            'email' => 'correo electrónico',
            'address' => 'dirección',
            'community' => 'comunidad',
        ];
    }

    /**
     * Obtener mensajes personalizados para errores del validador.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'owner_type.in' => 'El tipo de propietario debe ser Persona Natural u Organización.',
            'dui.digits' => 'El DUI debe tener exactamente 9 dígitos.',
            'dui.unique' => 'Este DUI ya está registrado en el sistema.',
            'tax_id.regex' => 'El formato del NIT no es válido. Debe ser: 0210-090676-001-4',
            'tax_id.unique' => 'Este NIT ya está registrado en el sistema.',
            'phone.digits' => 'El teléfono debe tener exactamente 8 dígitos.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'community.in' => 'La comunidad seleccionada no es válida.',
        ];
    }
}
