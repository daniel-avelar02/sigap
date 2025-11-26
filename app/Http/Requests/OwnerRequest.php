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

        return [
            'name' => ['required', 'string', 'max:255'],
            'dui' => [
                'required',
                'digits:9',
                Rule::unique('owners', 'dui')->ignore($ownerId),
            ],
            'phone' => ['required', 'digits:8'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'community' => ['required', 'string', Rule::in(Owner::COMMUNITIES)],
        ];
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
            'dui' => 'DUI',
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
            'dui.digits' => 'El DUI debe tener exactamente 9 dígitos.',
            'dui.unique' => 'Este DUI ya está registrado en el sistema.',
            'phone.digits' => 'El teléfono debe tener exactamente 8 dígitos.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'community.in' => 'La comunidad seleccionada no es válida.',
        ];
    }
}
