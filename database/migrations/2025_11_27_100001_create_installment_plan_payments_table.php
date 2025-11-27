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
        Schema::create('installment_plan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('installment_plan_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('installment_number')->comment('Número de cuota (1, 2, 3...)');
            $table->dateTime('payment_date');
            $table->string('receipt_number', 50)->unique()->comment('Número de comprobante único');
            $table->string('payer_name')->comment('Nombre completo de quien paga');
            $table->string('payer_dui', 9)->comment('DUI de quien paga (sin guion)');
            $table->decimal('amount_paid', 10, 2)->comment('Monto pagado (puede diferir del programado)');
            $table->text('notes')->nullable()->comment('Observaciones del pago');
            $table->foreignId('user_id')->constrained()->comment('Usuario que registró el pago');
            $table->timestamps();

            // Índices
            $table->index('installment_plan_id');
            $table->index('installment_number');
            $table->index('payment_date');
            $table->index('receipt_number');
            
            // Índice compuesto único para prevenir duplicados de cuota
            $table->unique(['installment_plan_id', 'installment_number'], 'unique_installment_payment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_plan_payments');
    }
};
