<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class InstallmentPlanSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Monto sugerido para instalación de paja
        SystemSetting::firstOrCreate(
            ['key' => 'installment_installation_amount'],
            [
                'value' => [
                    'amount' => 200.00,
                    'updated_at' => now()->toDateTimeString(),
                ],
                'description' => 'Monto sugerido para el plan de cuotas de instalación de paja',
            ]
        );

        // Monto sugerido para medidor
        SystemSetting::firstOrCreate(
            ['key' => 'installment_meter_amount'],
            [
                'value' => [
                    'amount' => 150.00,
                    'updated_at' => now()->toDateTimeString(),
                ],
                'description' => 'Monto sugerido para el plan de cuotas de medidor',
            ]
        );

        // Número de cuotas por defecto
        SystemSetting::firstOrCreate(
            ['key' => 'installment_default_term'],
            [
                'value' => [
                    'months' => 6,
                    'updated_at' => now()->toDateTimeString(),
                ],
                'description' => 'Número de cuotas recomendadas para planes de pago',
            ]
        );

        $this->command->info('Configuraciones de planes de cuotas creadas exitosamente.');
    }
}
