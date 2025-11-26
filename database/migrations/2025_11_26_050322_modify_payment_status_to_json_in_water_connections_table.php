<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('water_connections', function (Blueprint $table) {
            // Eliminar índice del campo payment_status
            $table->dropIndex(['payment_status']);
            
            // Agregar nueva columna temporal como JSON
            $table->json('payment_status_new')->after('status');
        });
        
        // Migrar datos existentes a formato JSON array
        DB::statement("UPDATE water_connections SET payment_status_new = JSON_ARRAY(payment_status)");
        
        Schema::table('water_connections', function (Blueprint $table) {
            // Eliminar columna antigua
            $table->dropColumn('payment_status');
            
            // Renombrar columna nueva
            $table->renameColumn('payment_status_new', 'payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('water_connections', function (Blueprint $table) {
            // Revertir a ENUM tomando el primer elemento del array JSON
            DB::statement("UPDATE water_connections SET payment_status = JSON_UNQUOTE(JSON_EXTRACT(payment_status, '$[0]'))");
            
            $table->enum('payment_status', ['al_dia', 'en_mora', 'en_mora_medidor', 'en_mora_instalacion'])
                ->default('al_dia')
                ->change();
            
            // Recrear índice
            $table->index('payment_status');
        });
    }
};
