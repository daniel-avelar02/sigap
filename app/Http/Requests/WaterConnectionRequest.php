<?php

namespace App\Http\Requests;

use App\Models\Owner;
use App\Models\WaterConnection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WaterConnectionRequest extends FormRequest
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
        $waterConnectionId = $this->route('water_connection');
        $community = $this->input('community');

        return [
            'owner_id' => ['required', 'exists:owners,id'],
            'owner_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('water_connections')
                    ->where('community', $community)
                    ->ignore($waterConnectionId),
            ],
            'community' => ['required', 'string', Rule::in(Owner::COMMUNITIES)],
            'location_description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'string', Rule::in(WaterConnection::STATUSES)],
            'comments' => ['nullable', 'string', 'max:1000'],
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
            'owner_number' => 'número de propietario',
            'owner_id' => 'propietario',
            'community' => 'comunidad',
            'location_description' => 'descripción de ubicación',
            'status' => 'estado',
            'comments' => 'comentarios',
        ];
    }

    /**
     * Obtener mensajes personalizados para errores del validador.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $community = $this->input('community', 'esta comunidad');
        
        return [
            'owner_id.required' => 'Debe seleccionar un propietario.',
            'owner_id.exists' => 'El propietario seleccionado no existe.',
            'owner_number.required' => 'El número de propietario es obligatorio.',
            'owner_number.unique' => "El número de propietario ya está registrado en la comunidad {$community}.",
            'community.in' => 'La comunidad seleccionada no es válida.',
            'status.in' => 'El estado seleccionado no es válido.',
            'location_description.max' => 'La descripción de ubicación no puede exceder 500 caracteres.',
            'comments.max' => 'Los comentarios no pueden exceder 1000 caracteres.',
        ];
    }
}
