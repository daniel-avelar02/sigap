<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    /**
     * Los atributos que deben ser casteados.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'array',
    ];

    /**
     * Obtener el monto actual de la cuota mensual.
     *
     * @return float
     */
    public static function getMonthlyFee(): float
    {
        $setting = self::where('key', 'monthly_fee')->first();
        
        if (!$setting) {
            return 10.00; // Valor por defecto
        }

        return (float) ($setting->value['amount'] ?? 10.00);
    }

    /**
     * Establecer un nuevo monto para la cuota mensual.
     *
     * @param float $amount
     * @return void
     */
    public static function setMonthlyFee(float $amount): void
    {
        $setting = self::firstOrCreate(
            ['key' => 'monthly_fee'],
            ['description' => 'Monto de la cuota mensual de agua']
        );

        $setting->value = [
            'amount' => $amount,
            'updated_at' => now()->toDateTimeString(),
        ];

        $setting->save();
    }

    /**
     * Obtener la fecha de inicio de cobros mensuales del sistema.
     *
     * @return string Fecha en formato Y-m-d (ejemplo: '2025-01-01')
     */
    public static function getMonthlyBillingStartDate(): string
    {
        $setting = self::where('key', 'monthly_billing_start_date')->first();
        
        if (!$setting) {
            return '2025-01-01'; // Valor por defecto
        }

        return $setting->value['date'] ?? '2025-01-01';
    }

    /**
     * Obtener el monto sugerido para instalación.
     *
     * @return float
     */
    public static function getInstallmentInstallationAmount(): float
    {
        $setting = self::where('key', 'installment_installation_amount')->first();
        
        if (!$setting) {
            return 200.00; // Valor por defecto
        }

        return (float) ($setting->value['amount'] ?? 200.00);
    }

    /**
     * Obtener el monto sugerido para medidor.
     *
     * @return float
     */
    public static function getInstallmentMeterAmount(): float
    {
        $setting = self::where('key', 'installment_meter_amount')->first();
        
        if (!$setting) {
            return 150.00; // Valor por defecto
        }

        return (float) ($setting->value['amount'] ?? 150.00);
    }

    /**
     * Obtener el número de cuotas por defecto.
     *
     * @return int
     */
    public static function getInstallmentDefaultTerm(): int
    {
        $setting = self::where('key', 'installment_default_term')->first();
        
        if (!$setting) {
            return 6; // Valor por defecto
        }

        return (int) ($setting->value['months'] ?? 6);
    }
}
