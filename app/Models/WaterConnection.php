<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaterConnection extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Estados operativos de la paja de agua
     */
    const STATUSES = [
        'activa',
        'suspendida',
    ];

    /**
     * Estados de pago
     * Estos estados son actualizados automáticamente por el módulo de cobros
     */
    const PAYMENT_STATUSES = [
        'al_dia',
        'en_mora',
        'en_mora_medidor',
        'en_mora_instalacion',
    ];

    /**
     * Mapeo de colores para estados operativos
     */
    const STATUS_COLORS = [
        'activa' => 'green',
        'suspendida' => 'red',
    ];

    /**
     * Mapeo de colores para estados de pago
     */
    const PAYMENT_STATUS_COLORS = [
        'al_dia' => 'green',
        'en_mora' => 'red',
        'en_mora_medidor' => 'orange',
        'en_mora_instalacion' => 'yellow',
    ];

    /**
     * Etiquetas en español para estados de pago
     */
    const PAYMENT_STATUS_LABELS = [
        'al_dia' => 'Al día',
        'en_mora' => 'En mora',
        'en_mora_medidor' => 'Mora medidor',
        'en_mora_instalacion' => 'Mora instalación',
    ];

    /**
     * Los atributos que se pueden asignar en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'owner_number',
        'owner_id',
        'community',
        'location_description',
        'status',
        'payment_status',
        'comments',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_status' => 'array',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación: Una paja de agua pertenece a un propietario
     *
     * @return BelongsTo
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    /**
     * Scope para buscar pajas de agua por código, número de propietario, nombre o DUI del propietario
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, ?string $search)
    {
        if (!$search) {
            return $query;
        }

        $searchClean = str_replace('-', '', $search);

        return $query->where(function ($q) use ($search, $searchClean) {
            $q->where('code', 'like', "%{$search}%")
              ->orWhere('owner_number', 'like', "%{$search}%")
              ->orWhereHas('owner', function ($ownerQuery) use ($search, $searchClean) {
                  $ownerQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('dui', 'like', "%{$searchClean}%");
              });
        });
    }

    /**
     * Scope para filtrar por propietario
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int|null $ownerId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByOwner($query, ?int $ownerId)
    {
        if (!$ownerId) {
            return $query;
        }

        return $query->where('owner_id', $ownerId);
    }

    /**
     * Scope para filtrar por comunidad
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $community
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCommunity($query, ?string $community)
    {
        if (!$community) {
            return $query;
        }

        return $query->where('community', $community);
    }

    /**
     * Scope para filtrar por estado operativo
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, ?string $status)
    {
        if (!$status) {
            return $query;
        }

        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar por estado de pago
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $paymentStatus
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPaymentStatus($query, ?string $paymentStatus)
    {
        if (!$paymentStatus) {
            return $query;
        }

        // Buscar en el array JSON usando JSON_CONTAINS
        return $query->whereRaw('JSON_CONTAINS(payment_status, ?)', [json_encode($paymentStatus)]);
    }

    /**
     * Scope para obtener solo pajas activas
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'activa');
    }

    /**
     * Actualiza el estado de pago basado en los pagos pendientes
     * 
     * Este método será invocado desde el módulo de Cobros cuando se registren o eliminen pagos.
     * Los estados de pago pueden combinarse (excepto 'al_dia'):
     * - 'al_dia': No tiene ninguna mora (exclusivo, no se combina)
     * - 'en_mora': Cuota mensual pendiente
     * - 'en_mora_medidor': Pago de medidor incompleto
     * - 'en_mora_instalacion': Pago de instalación pendiente
     *
     * @return void
     */
    public function updatePaymentStatus(): void
    {
        // TODO: Implementar lógica completa cuando se cree el módulo de Cobros
        // Esta es una implementación placeholder que será completada después
        
        // Ejemplo de lógica a implementar:
        // $statuses = [];
        // if (tiene_pagos_mensuales_pendientes) $statuses[] = 'en_mora';
        // if (tiene_cuotas_medidor_pendientes) $statuses[] = 'en_mora_medidor';
        // if (tiene_cuotas_instalacion_pendientes) $statuses[] = 'en_mora_instalacion';
        // if (empty($statuses)) $statuses = ['al_dia'];
        // $this->update(['payment_status' => $statuses]);
    }

    /**
     * Verifica si la conexión está al día con los pagos
     *
     * @return bool
     */
    public function isPaymentUpToDate(): bool
    {
        return in_array('al_dia', $this->payment_status ?? []);
    }

    /**
     * Verifica si tiene un estado de pago específico
     *
     * @param string $status
     * @return bool
     */
    public function hasPaymentStatus(string $status): bool
    {
        return in_array($status, $this->payment_status ?? []);
    }

    /**
     * Obtiene los estados de pago formateados para mostrar
     *
     * @return array
     */
    public function getFormattedPaymentStatusesAttribute(): array
    {
        return array_map(function($status) {
            return self::PAYMENT_STATUS_LABELS[$status] ?? $status;
        }, $this->payment_status ?? ['al_dia']);
    }
}
