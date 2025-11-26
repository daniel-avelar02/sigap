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
        Schema::create('owners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('dui', 9)->unique();
            $table->string('phone', 8);
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->enum('community', [
                'La Pandeadura',
                'La Puerta',
                'Loma Larga',
                'Rodeo 1',
                'Rodeo 2',
                'San Francisco',
                'San Rafael',
                'San Rafael (Los Pinos)',
            ]);
            $table->softDeletes();
            $table->timestamps();

            // Índices para mejorar rendimiento de búsquedas
            $table->index('dui');
            $table->index('community');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owners');
    }
};
