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
        Schema::table('monthly_payments', function (Blueprint $table) {
            // Agregar columnas para soportar múltiples meses en un pago
            $table->string('payment_group_id', 50)->nullable()->after('receipt_number');
            $table->tinyInteger('months_count')->unsigned()->default(1)->after('payment_group_id');
            
            // Índice para agrupar pagos múltiples
            $table->index('payment_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('monthly_payments', function (Blueprint $table) {
            $table->dropIndex(['payment_group_id']);
            $table->dropColumn(['payment_group_id', 'months_count']);
        });
    }
};
