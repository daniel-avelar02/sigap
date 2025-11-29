<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payment_id',
        'item_type',
        'monthly_payment_id',
        'installment_plan_payment_id',
        'other_payment_id',
        'amount',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Available item types.
     */
    const ITEM_TYPES = [
        'monthly' => 'Pago Mensual',
        'installment' => 'Cuota de Plan',
        'other' => 'Otro Pago',
    ];

    /**
     * Get the payment that owns this item.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the monthly payment if this is a monthly payment item.
     */
    public function monthlyPayment(): BelongsTo
    {
        return $this->belongsTo(MonthlyPayment::class);
    }

    /**
     * Get the installment plan payment if this is an installment item.
     */
    public function installmentPlanPayment(): BelongsTo
    {
        return $this->belongsTo(InstallmentPlanPayment::class);
    }

    /**
     * Get the other payment if this is an other payment item.
     */
    public function otherPayment(): BelongsTo
    {
        return $this->belongsTo(OtherPayment::class);
    }

    /**
     * Get the item type name.
     */
    public function getItemTypeNameAttribute(): string
    {
        return self::ITEM_TYPES[$this->item_type] ?? $this->item_type;
    }

    /**
     * Get the related payment entity based on item type.
     */
    public function getRelatedPaymentAttribute()
    {
        return match ($this->item_type) {
            'monthly' => $this->monthlyPayment,
            'installment' => $this->installmentPlanPayment,
            'other' => $this->otherPayment,
            default => null,
        };
    }
}
