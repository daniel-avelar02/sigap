<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class InstallmentPlan extends Model
{
    use SoftDeletes;

    /**
     * Tipos de planes de cuotas
     */
    const PLAN_TYPES = [
        'installation' => 'Instalación de paja',
        'meter' => 'Medidor',
    ];

    /**
     * Estados del plan
     */
    const STATUSES = [
        'active' => 'Activo',
        'completed' => 'Completado',
        'cancelled' => 'Cancelado',
    ];

    /**
     * Colores para estados
     */
    const STATUS_COLORS = [
        'active' => 'blue',
        'completed' => 'green',
        'cancelled' => 'gray',
    ];

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'water_connection_id',
        'plan_type',
        'total_amount',
        'installment_count',
        'installment_amount',
        'start_date',
        'status',
        'notes',
        'completed_at',
        'completed_by',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'start_date' => 'date',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relación con la paja de agua.
     *
     * @return BelongsTo
     */
    public function waterConnection(): BelongsTo
    {
        return $this->belongsTo(WaterConnection::class);
    }

    /**
     * Relación con los pagos de cuotas.
     *
     * @return HasMany
     */
    public function payments(): HasMany
    {
        return $this->hasMany(InstallmentPlanPayment::class)->orderBy('installment_number');
    }

    /**
     * Relación con el usuario que completó el plan.
     *
     * @return BelongsTo
     */
    public function completedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Relación con el usuario que canceló el plan.
     *
     * @return BelongsTo
     */
    public function cancelledByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Calcular el monto total pagado hasta el momento.
     *
     * @return float
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->payments()->sum('amount_paid');
    }

    /**
     * Calcular el saldo pendiente.
     *
     * @return float
     */
    public function getBalanceAttribute(): float
    {
        return max(0, $this->total_amount - $this->total_paid);
    }

    /**
     * Número de cuotas pagadas.
     *
     * @return int
     */
    public function getInstallmentsPaidCountAttribute(): int
    {
        return $this->payments()->count();
    }

    /**
     * Número de cuotas pendientes (basado en la diferencia).
     *
     * @return int
     */
    public function getInstallmentsPendingCountAttribute(): int
    {
        return max(0, $this->installment_count - $this->installments_paid_count);
    }

    /**
     * Porcentaje de avance del plan (0-100).
     *
     * @return float
     */
    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_amount == 0) {
            return 100;
        }

        return min(100, ($this->total_paid / $this->total_amount) * 100);
    }

    /**
     * Verificar si el plan está completado (saldo = 0).
     *
     * @return bool
     */
    public function isCompleted(): bool
    {
        return $this->balance <= 0;
    }

    /**
     * Obtener nombre del tipo de plan en español.
     *
     * @return string
     */
    public function getPlanTypeNameAttribute(): string
    {
        return self::PLAN_TYPES[$this->plan_type] ?? $this->plan_type;
    }

    /**
     * Obtener nombre del estado en español.
     *
     * @return string
     */
    public function getStatusNameAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Actualizar el estado del plan basado en los pagos.
     *
     * @param int|null $userId Usuario que realiza la actualización
     * @return void
     */
    public function updatePlanStatus(?int $userId = null): void
    {
        // Si el plan está cancelado, no actualizar
        if ($this->status === 'cancelled') {
            return;
        }

        // Si el saldo es 0 o negativo, marcar como completado
        if ($this->isCompleted() && $this->status !== 'completed') {
            $this->update([
                'status' => 'completed',
                'completed_at' => now(),
                'completed_by' => $userId ?? auth()->id(),
            ]);
        }
    }

    /**
     * Actualizar el estado de pago de la paja de agua asociada.
     * 
     * Agrega o remueve los estados 'en_mora_medidor' o 'en_mora_instalacion'
     * según el estado y saldo del plan.
     *
     * @return void
     */
    public function updateWaterConnectionStatus(): void
    {
        $waterConnection = $this->waterConnection;
        
        if (!$waterConnection) {
            return;
        }

        $currentStatuses = $waterConnection->payment_status ?? [];
        
        // Determinar qué estado de mora corresponde a este tipo de plan
        $moraStatus = $this->plan_type === 'meter' ? 'en_mora_medidor' : 'en_mora_instalacion';
        
        // Si el plan está activo con saldo pendiente, agregar el estado de mora
        if ($this->status === 'active' && $this->balance > 0) {
            if (!in_array($moraStatus, $currentStatuses)) {
                $currentStatuses[] = $moraStatus;
            }
        } else {
            // Si el plan está completado o cancelado, remover el estado de mora
            $currentStatuses = array_filter($currentStatuses, function($status) use ($moraStatus) {
                return $status !== $moraStatus;
            });
        }

        // Si no quedan estados de mora, agregar 'al_dia'
        $hasMora = count(array_intersect($currentStatuses, ['en_mora', 'en_mora_medidor', 'en_mora_instalacion'])) > 0;
        
        if (!$hasMora) {
            $currentStatuses = ['al_dia'];
        } else {
            // Remover 'al_dia' si hay mora
            $currentStatuses = array_filter($currentStatuses, function($status) {
                return $status !== 'al_dia';
            });
        }

        // Re-indexar array para evitar problemas con JSON
        $waterConnection->update([
            'payment_status' => array_values($currentStatuses)
        ]);
    }

    /**
     * Cancelar el plan.
     *
     * @param string $reason Motivo de cancelación
     * @param int|null $userId Usuario que cancela
     * @return void
     */
    public function cancel(string $reason, ?int $userId = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $userId ?? auth()->id(),
            'cancellation_reason' => $reason,
        ]);

        // Actualizar estado de la paja
        $this->updateWaterConnectionStatus();
    }

    /**
     * Reactivar un plan cancelado.
     *
     * @return void
     */
    public function reactivate(): void
    {
        $this->update([
            'status' => $this->isCompleted() ? 'completed' : 'active',
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancellation_reason' => null,
        ]);

        // Actualizar estado de la paja
        $this->updateWaterConnectionStatus();
    }

    /**
     * Scope para filtrar por paja de agua.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $waterConnectionId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByWaterConnection($query, int $waterConnectionId)
    {
        return $query->where('water_connection_id', $waterConnectionId);
    }

    /**
     * Scope para filtrar por tipo de plan.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $planType
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPlanType($query, ?string $planType)
    {
        if (!$planType) {
            return $query;
        }

        return $query->where('plan_type', $planType);
    }

    /**
     * Scope para filtrar por estado.
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
     * Scope para filtrar por comunidad (a través de la paja).
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

        return $query->whereHas('waterConnection', function($q) use ($community) {
            $q->where('community', $community);
        });
    }

    /**
     * Scope para obtener solo planes activos.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Boot del modelo para eventos.
     */
    protected static function boot()
    {
        parent::boot();

        // Al eliminar (soft delete) un plan, cancelarlo si está activo
        static::deleting(function ($plan) {
            if ($plan->status === 'active' && !$plan->isForceDeleting()) {
                $plan->cancel('Plan cancelado automáticamente', auth()->id());
            }
        });
    }
}
