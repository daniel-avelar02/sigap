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
            // Agregar columna para almacenar múltiples meses en un solo registro
            $table->json('months_paid')->nullable()->after('payment_year');
            
            // Hacer que payment_month y payment_year sean opcionales 
            // ya que ahora se usará months_paid para múltiples meses
            $table->tinyInteger('payment_month')->unsigned()->nullable()->change();
            $table->smallInteger('payment_year')->unsigned()->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('monthly_payments', function (Blueprint $table) {
            $table->dropColumn('months_paid');
            
            // Revertir a no nullable
            $table->tinyInteger('payment_month')->unsigned()->nullable(false)->change();
            $table->smallInteger('payment_year')->unsigned()->nullable(false)->change();
        });
    }
};
