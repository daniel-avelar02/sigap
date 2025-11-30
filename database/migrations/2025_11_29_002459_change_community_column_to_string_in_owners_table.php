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
        Schema::table('owners', function (Blueprint $table) {
            // Cambiar la columna community de enum a string para soportar nombres más largos
            $table->string('community', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('owners', function (Blueprint $table) {
            // Revertir a enum
            $table->enum('community', [
                'La Pandeadura',
                'La Puerta',
                'Loma Larga',
                'Rodeo 1',
                'Rodeo 2',
                'San Francisco',
                'San Rafael',
                'San Rafael (Los Pinos)',
                'San Rafael (Los Pinos Cantarera)',
            ])->change();
        });
    }
};
