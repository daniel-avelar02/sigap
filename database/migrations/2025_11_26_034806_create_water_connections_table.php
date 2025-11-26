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
        Schema::create('water_connections', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('Código único generado automáticamente (WC-XXXXX)');
            $table->string('owner_number', 50)->nullable()->comment('Número de propietario legacy de la asociación');
            $table->foreignId('owner_id')->constrained('owners')->onDelete('cascade');
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
            $table->text('location_description')->nullable()->comment('Descripción de la ubicación de la paja');
            $table->enum('status', ['activa', 'suspendida'])->default('activa')->comment('Estado operativo de la paja');
            $table->enum('payment_status', ['al_dia', 'en_mora', 'en_mora_medidor', 'en_mora_instalacion'])
                ->default('al_dia')
                ->comment('Estado de pago, actualizado automáticamente por el módulo de cobros');
            $table->text('comments')->nullable()->comment('Comentarios adicionales');
            $table->softDeletes();
            $table->timestamps();

            // Índices para optimizar consultas
            $table->index('code');
            $table->index('owner_id');
            $table->index('community');
            $table->index('status');
            $table->index('payment_status');
            $table->index('deleted_at');
            
            // Índice compuesto único: owner_number debe ser único por comunidad
            // Permite que el mismo número se repita en diferentes comunidades
            $table->unique(['owner_number', 'community'], 'unique_owner_number_per_community');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('water_connections');
    }
};
