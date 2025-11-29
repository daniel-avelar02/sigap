<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'water_connection_id',
        'receipt_number',
        'total_amount',
        'payer_name',
        'payer_dui',
        'payment_date',
        'notes',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payment_date' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the water connection associated with this payment.
     */
    public function waterConnection(): BelongsTo
    {
        return $this->belongsTo(WaterConnection::class);
    }

    /**
     * Get the user who registered this payment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payment items for this payment.
     */
    public function paymentItems(): HasMany
    {
        return $this->hasMany(PaymentItem::class);
    }

    /**
     * Generate a unique receipt number for the payment.
     * Uses global sequence shared with MonthlyPayment, InstallmentPlanPayment, and OtherPayment.
     *
     * @return string
     */
    public static function generateReceiptNumber(): string
    {
        // Buscar el último número en todas las tablas relevantes
        $lastPayment = self::orderBy('id', 'desc')->first();
        $lastMonthlyPayment = MonthlyPayment::orderBy('id', 'desc')->first();
        $lastInstallmentPayment = InstallmentPlanPayment::orderBy('id', 'desc')->first();
        $lastOtherPayment = OtherPayment::withTrashed()->orderBy('id', 'desc')->first();

        // Obtener números de recibo (sin prefijos)
        $lastPaymentNumber = $lastPayment ? (int) $lastPayment->receipt_number : 0;
        $lastMonthlyNumber = $lastMonthlyPayment ? (int) $lastMonthlyPayment->receipt_number : 0;
        $lastInstallmentNumber = $lastInstallmentPayment ? (int) $lastInstallmentPayment->receipt_number : 0;
        
        // Para OtherPayment, remover el prefijo 'OP-' si existe
        $lastOtherNumber = 0;
        if ($lastOtherPayment && $lastOtherPayment->receipt_number) {
            $otherNumber = str_replace('OP-', '', $lastOtherPayment->receipt_number);
            $lastOtherNumber = (int) $otherNumber;
        }

        // Tomar el máximo de todos
        $nextNumber = max($lastPaymentNumber, $lastMonthlyNumber, $lastInstallmentNumber, $lastOtherNumber) + 1;

        return str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }
}
