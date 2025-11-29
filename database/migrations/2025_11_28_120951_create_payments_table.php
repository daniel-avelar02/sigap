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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('water_connection_id')
                ->constrained('water_connections')
                ->cascadeOnDelete();
            $table->string('receipt_number', 50)->unique();
            $table->decimal('total_amount', 10, 2);
            $table->string('payer_name');
            $table->string('payer_dui', 9);
            $table->dateTime('payment_date');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestamps();

            // Índices para optimización
            $table->index('receipt_number');
            $table->index('payment_date');
            $table->index('water_connection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
