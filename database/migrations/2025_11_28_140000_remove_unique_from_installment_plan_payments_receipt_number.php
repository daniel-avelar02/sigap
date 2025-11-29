<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('installment_plan_payments', function (Blueprint $table) {
            // Remover el índice único de receipt_number
            // Esto permite que múltiples cuotas de diferentes planes compartan el mismo número de recibo
            // cuando forman parte de un mismo ticket de pago unificado
            $table->dropUnique(['receipt_number']);
            
            // El índice normal ya existe desde la migración original
            // Esto mantiene las búsquedas rápidas por número de recibo
            
            // La restricción unique_installment_payment se mantiene para prevenir
            // que se registre la misma cuota del mismo plan dos veces
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('installment_plan_payments', function (Blueprint $table) {
            // Restaurar la restricción única si se revierte la migración
            $table->unique('receipt_number');
        });
    }
};
