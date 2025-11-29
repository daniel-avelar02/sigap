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
        Schema::create('payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')
                ->constrained('payments')
                ->cascadeOnDelete();
            $table->enum('item_type', ['monthly', 'installment', 'other']);
            $table->foreignId('monthly_payment_id')
                ->nullable()
                ->constrained('monthly_payments')
                ->cascadeOnDelete();
            $table->foreignId('installment_plan_payment_id')
                ->nullable()
                ->constrained('installment_plan_payments')
                ->cascadeOnDelete();
            $table->foreignId('other_payment_id')
                ->nullable()
                ->constrained('other_payments')
                ->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('description');
            $table->timestamps();

            // Índices
            $table->index('payment_id');
            $table->index('item_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_items');
    }
};
