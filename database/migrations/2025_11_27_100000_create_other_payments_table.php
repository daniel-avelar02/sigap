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
        Schema::create('other_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('water_connection_id')->constrained()->onDelete('cascade');
            $table->enum('payment_type', [
                'reconexion',
                'reparaciones',
                'accesorios',
                'traslados_traspasos',
                'prima_instalacion',
                'multas',
                'otros'
            ]);
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->string('payer_name');
            $table->string('payer_dui', 10);
            $table->text('additional_notes')->nullable();
            $table->string('receipt_number')->unique();
            $table->dateTime('payment_date');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            // Índices para optimizar búsquedas
            $table->index('payment_type');
            $table->index('payment_date');
            $table->index('receipt_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('other_payments');
    }
};
