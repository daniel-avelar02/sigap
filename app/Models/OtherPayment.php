<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OtherPayment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'water_connection_id',
        'payment_type',
        'description',
        'amount',
        'payer_name',
        'payer_dui',
        'additional_notes',
        'receipt_number',
        'payment_date',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    /**
     * Tipos de pago disponibles.
     */
    public const PAYMENT_TYPES = [
        'reconexion' => 'Reconexión',
        'reparaciones' => 'Reparaciones',
        'accesorios' => 'Accesorios',
        'traslados_traspasos' => 'Traslados/Traspasos',
        'prima_instalacion' => 'Prima de Instalación',
        'multas' => 'Multas',
        'otros' => 'Otros Conceptos',
    ];

    /**
     * Relación con la paja de agua.
     */
    public function waterConnection(): BelongsTo
    {
        return $this->belongsTo(WaterConnection::class);
    }

    /**
     * Relación con el usuario que registró el pago.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generar número de recibo único.
     */
    public static function generateReceiptNumber(): string
    {
        $lastPayment = self::withTrashed()
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastPayment ? $lastPayment->id + 1 : 1;
        
        return 'OP-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Obtener el nombre del tipo de pago.
     */
    public function getPaymentTypeNameAttribute(): string
    {
        return self::PAYMENT_TYPES[$this->payment_type] ?? $this->payment_type;
    }

    /**
     * Scope para filtrar por tipo de pago.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('payment_type', $type);
    }

    /**
     * Scope para filtrar por rango de fechas.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    /**
     * Scope para filtrar por comunidad a través de la paja.
     */
    public function scopeByCommunity($query, $community)
    {
        return $query->whereHas('waterConnection', function ($q) use ($community) {
            $q->where('community', $community);
        });
    }
}
