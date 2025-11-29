<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class WaterConnection extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Comunidades disponibles en el sistema
     */
    const COMMUNITIES = [
        'La Pandeadura',
        'La Puerta',
        'Loma Larga',
        'Rodeo 1',
        'Rodeo 2',
        'San Francisco',
        'San Rafael',
        'San Rafael (Los Pinos)',
    ];

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
     * Relación: Una paja de agua tiene muchos pagos mensuales
     *
     * @return HasMany
     */
    public function monthlyPayments(): HasMany
    {
        return $this->hasMany(MonthlyPayment::class)
                    ->orderByDesc('payment_year')
                    ->orderByDesc('payment_month');
    }

    /**
     * Relación: Una paja de agua tiene muchos planes de cuotas
     *
     * @return HasMany
     */
    public function installmentPlans(): HasMany
    {
        return $this->hasMany(InstallmentPlan::class)->orderByDesc('created_at');
    }

    /**
     * Relación: Una paja de agua tiene muchos otros pagos
     *
     * @return HasMany
     */
    public function otherPayments(): HasMany
    {
        return $this->hasMany(OtherPayment::class)->orderByDesc('payment_date');
    }

    /**
     * Cancelar todos los planes activos (al eliminar la paja).
     *
     * @param string $reason
     * @return void
     */
    public function cancelActivePlans(string $reason = 'Paja de agua eliminada'): void
    {
        $this->installmentPlans()
             ->where('status', 'active')
             ->each(function($plan) use ($reason) {
                 $plan->cancel($reason, Auth::id());
             });
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
     * Calcula los meses desde la fecha MÁS RECIENTE entre:
     * - Fecha de inicio de cobros del sistema (2025-01-01) para pajas antiguas migradas
     * - Fecha de creación (created_at) para pajas nuevas creadas en producción
     * 
     * Esto permite:
     * - Pajas migradas: No cobrar deudas históricas (se manejan en Otros Pagos)
     * - Pajas nuevas: Cobrar todos los meses desde su creación
     * 
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
        // Obtener el array actual de estados de pago
        $currentStatuses = $this->payment_status ?? [];
        
        // Remover 'al_dia' y 'en_mora' del array (los recalcularemos)
        $otherStatuses = array_filter($currentStatuses, function($status) {
            return !in_array($status, ['al_dia', 'en_mora']);
        });

        // Calcular si hay meses pendientes
        $hasPendingMonths = $this->hasPendingMonthlyPayments();

        // Construir el nuevo array de estados
        $newStatuses = [];

        // Si hay meses pendientes, agregar 'en_mora'
        if ($hasPendingMonths) {
            $newStatuses[] = 'en_mora';
        }

        // Agregar los otros estados (mora medidor, mora instalación)
        $newStatuses = array_merge($newStatuses, array_values($otherStatuses));

        // Si no hay ningún estado de mora, poner 'al_dia'
        if (empty($newStatuses)) {
            $newStatuses = ['al_dia'];
        }

        // Actualizar el estado de pago
        $this->update(['payment_status' => $newStatuses]);
    }

    /**
     * Verifica si hay meses pendientes de pago.
     * 
     * Calcula desde la fecha MÁS RECIENTE entre:
     * - La fecha de inicio de cobros del sistema (para pajas migradas)
     * - La fecha de creación de la paja (para pajas nuevas)
     * 
     * Esto permite manejar deudas históricas por separado en pajas antiguas,
     * pero cobrar correctamente desde la creación en pajas nuevas.
     *
     * @return bool
     */
    private function hasPendingMonthlyPayments(): bool
    {
        // Obtener fecha de inicio de cobros del sistema y fecha de creación de la paja
        $systemBillingStartDate = Carbon::parse(SystemSetting::getMonthlyBillingStartDate());
        $pajaCreatedDate = Carbon::parse($this->created_at);
        $currentDate = Carbon::now();

        // Usar la fecha MÁS RECIENTE (la que ocurrió después)
        $billingStartDate = $pajaCreatedDate->gt($systemBillingStartDate) 
            ? $pajaCreatedDate 
            : $systemBillingStartDate;

        // Obtener todos los pagos de esta paja y extraer los meses pagados
        $paidMonths = [];
        $this->monthlyPayments()->get()->each(function($payment) use (&$paidMonths) {
            // Si tiene months_paid (nuevo formato), usar esos meses
            if ($payment->months_paid && is_array($payment->months_paid)) {
                foreach ($payment->months_paid as $mp) {
                    $paidMonths[] = $mp['year'] . '-' . str_pad($mp['month'], 2, '0', STR_PAD_LEFT);
                }
            } else {
                // Formato antiguo: usar payment_month y payment_year
                $paidMonths[] = $payment->payment_year . '-' . str_pad($payment->payment_month, 2, '0', STR_PAD_LEFT);
            }
        });
        
        $paidMonths = array_unique($paidMonths);

        // Generar lista de todos los meses que deberían estar pagados
        $requiredMonths = [];
        $checkDate = $billingStartDate->copy()->startOfMonth();
        
        while ($checkDate <= $currentDate) {
            $requiredMonths[] = $checkDate->format('Y-m');
            $checkDate->addMonth();
        }

        // Verificar si hay algún mes requerido que no está pagado
        foreach ($requiredMonths as $requiredMonth) {
            if (!in_array($requiredMonth, $paidMonths)) {
                return true; // Hay al menos un mes pendiente
            }
        }

        return false; // Todos los meses están pagados
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
