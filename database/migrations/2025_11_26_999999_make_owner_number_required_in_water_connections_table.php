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
        // Primero, asignar un número secuencial a los registros que tienen owner_number NULL
        DB::statement("
            UPDATE water_connections wc1
            LEFT JOIN (
                SELECT id, community,
                       ROW_NUMBER() OVER (PARTITION BY community ORDER BY id) as new_number
                FROM water_connections
                WHERE owner_number IS NULL
            ) wc2 ON wc1.id = wc2.id
            SET wc1.owner_number = wc2.new_number
            WHERE wc1.owner_number IS NULL
        ");

        // Ahora cambiar la columna a NOT NULL
        Schema::table('water_connections', function (Blueprint $table) {
            $table->string('owner_number', 50)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('water_connections', function (Blueprint $table) {
            $table->string('owner_number', 50)->nullable()->change();
        });
    }
};
