<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyPayment extends Model
{
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'water_connection_id',
        'payment_month',
        'payment_year',
        'payment_date',
        'receipt_number',
        'payment_group_id',
        'months_count',
        'payer_name',
        'payer_dui',
        'monthly_fee_amount',
        'total_amount',
        'notes',
        'user_id',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_date' => 'datetime',
        'monthly_fee_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
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
     * Relación con el usuario que registró el pago.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
     * Scope para filtrar por año.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $year
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByYear($query, int $year)
    {
        return $query->where('payment_year', $year);
    }

    /**
     * Scope para filtrar por grupo de pago.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $groupId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPaymentGroup($query, string $groupId)
    {
        return $query->where('payment_group_id', $groupId);
    }

    /**
     * Generar un ID único para un grupo de pagos.
     *
     * @return string
     */
    public static function generatePaymentGroupId(): string
    {
        return 'PAY-' . date('YmdHis') . '-' . uniqid();
    }

    /**
     * Generar el siguiente número de recibo.
     *
     * @return string
     */
    public static function generateReceiptNumber(): string
    {
        $lastPayment = self::orderBy('id', 'desc')->first();
        $nextNumber = $lastPayment ? ((int) $lastPayment->receipt_number) + 1 : 1;
        
        return str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Obtener el nombre del mes en español.
     *
     * @return string
     */
    public function getMonthNameAttribute(): string
    {
        $months = [
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre',
        ];

        return $months[$this->payment_month] ?? '';
    }

    /**
     * Obtener el período de pago formateado (Mes Año).
     *
     * @return string
     */
    public function getPaymentPeriodAttribute(): string
    {
        return $this->month_name . ' ' . $this->payment_year;
    }
}
