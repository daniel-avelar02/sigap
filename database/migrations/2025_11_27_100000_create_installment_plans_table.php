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
        Schema::create('installment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('water_connection_id')->constrained()->onDelete('cascade');
            $table->enum('plan_type', ['installation', 'meter'])->comment('Tipo de plan: instalación o medidor');
            $table->decimal('total_amount', 10, 2)->comment('Monto total del plan');
            $table->unsignedTinyInteger('installment_count')->comment('Número total de cuotas');
            $table->decimal('installment_amount', 10, 2)->comment('Monto sugerido por cuota');
            $table->date('start_date')->comment('Fecha de inicio del plan');
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active')->comment('Estado del plan');
            $table->text('notes')->nullable()->comment('Observaciones o notas especiales');
            $table->timestamp('completed_at')->nullable()->comment('Fecha de completación');
            $table->foreignId('completed_by')->nullable()->constrained('users')->comment('Usuario que completó el plan');
            $table->timestamp('cancelled_at')->nullable()->comment('Fecha de cancelación');
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->comment('Usuario que canceló');
            $table->text('cancellation_reason')->nullable()->comment('Motivo de cancelación');
            $table->softDeletes();
            $table->timestamps();

            // Índices
            $table->index('water_connection_id');
            $table->index('plan_type');
            $table->index('status');
            $table->index('start_date');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_plans');
    }
};
