<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class InstallmentPlanPayment extends Model
{
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'installment_plan_id',
        'installment_number',
        'payment_date',
        'receipt_number',
        'payer_name',
        'payer_dui',
        'amount_paid',
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
        'amount_paid' => 'decimal:2',
    ];

    /**
     * Relación con el plan de cuotas.
     *
     * @return BelongsTo
     */
    public function installmentPlan(): BelongsTo
    {
        return $this->belongsTo(InstallmentPlan::class);
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
     * Generar el siguiente número de recibo.
     * 
     * Usa numeración global compartida con Payment, MonthlyPayment y OtherPayment.
     *
     * @return string
     */
    public static function generateReceiptNumber(): string
    {
        // Buscar el último número en todas las tablas
        $lastMonthlyPayment = MonthlyPayment::orderBy('id', 'desc')->first();
        $lastInstallmentPayment = self::orderBy('id', 'desc')->first();
        $lastOtherPayment = OtherPayment::withTrashed()->orderBy('id', 'desc')->first();
        $lastPayment = Payment::orderBy('id', 'desc')->first();

        $lastMonthlyNumber = $lastMonthlyPayment ? (int) $lastMonthlyPayment->receipt_number : 0;
        $lastInstallmentNumber = $lastInstallmentPayment ? (int) $lastInstallmentPayment->receipt_number : 0;
        $lastPaymentNumber = $lastPayment ? (int) $lastPayment->receipt_number : 0;
        
        // Para OtherPayment, remover el prefijo 'OP-' si existe
        $lastOtherNumber = 0;
        if ($lastOtherPayment && $lastOtherPayment->receipt_number) {
            $otherNumber = str_replace('OP-', '', $lastOtherPayment->receipt_number);
            $lastOtherNumber = (int) $otherNumber;
        }

        $nextNumber = max($lastMonthlyNumber, $lastInstallmentNumber, $lastOtherNumber, $lastPaymentNumber) + 1;

        return str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Boot del modelo para eventos.
     */
    protected static function boot()
    {
        parent::boot();

        // Después de crear un pago, actualizar el estado del plan
        static::created(function ($payment) {
            $payment->installmentPlan->updatePlanStatus(Auth::id());
            $payment->installmentPlan->updateWaterConnectionStatus();
        });

        // Si se elimina un pago, recalcular el estado del plan
        static::deleted(function ($payment) {
            $payment->installmentPlan->updatePlanStatus();
            $payment->installmentPlan->updateWaterConnectionStatus();
        });
    }
}
