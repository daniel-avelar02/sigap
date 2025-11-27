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
        Schema::create('monthly_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('water_connection_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('payment_month')->unsigned(); // 1-12
            $table->smallInteger('payment_year')->unsigned(); // 2024, 2025...
            $table->dateTime('payment_date');
            $table->string('receipt_number', 50)->unique();
            $table->string('payer_name');
            $table->string('payer_dui', 9);
            $table->decimal('monthly_fee_amount', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained();
            $table->timestamps();

            // Índice compuesto único para prevenir duplicados
            $table->unique(['water_connection_id', 'payment_month', 'payment_year'], 'unique_payment_month_year');
            
            // Índices para mejorar búsquedas
            $table->index('payment_date');
            $table->index('receipt_number');
            $table->index('payment_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_payments');
    }
};
