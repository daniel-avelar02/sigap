<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar configuración de fecha de inicio de cobros mensuales
        DB::table('system_settings')->insert([
            'key' => 'monthly_billing_start_date',
            'value' => json_encode([
                'date' => '2025-01-01',
                'description' => 'Fecha desde la cual se calculan los cobros mensuales para todas las pajas de agua',
            ]),
            'description' => 'Fecha de inicio de cobros mensuales del sistema',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('system_settings')
            ->where('key', 'monthly_billing_start_date')
            ->delete();
    }
};
