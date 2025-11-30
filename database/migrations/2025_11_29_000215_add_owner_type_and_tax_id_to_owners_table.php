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
            // Agregar campo para tipo de propietario (persona natural u organización)
            $table->enum('owner_type', ['natural', 'organization'])
                ->default('natural')
                ->after('name')
                ->comment('Tipo de propietario: natural (persona) u organization (empresa/organización)');
            
            // Agregar campo para NIT (usado por organizaciones)
            $table->string('tax_id', 20)
                ->nullable()
                ->after('owner_type')
                ->comment('NIT para organizaciones (formato: 0210-090676-001-4)');
            
            // Hacer el DUI nullable ya que las organizaciones usan NIT
            $table->string('dui', 9)
                ->nullable()
                ->change()
                ->comment('DUI para personas naturales (9 dígitos)');
            
            // Agregar índice para tax_id
            $table->index('tax_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('owners', function (Blueprint $table) {
            // Eliminar índice
            $table->dropIndex(['tax_id']);
            
            // Eliminar columnas agregadas
            $table->dropColumn(['owner_type', 'tax_id']);
            
            // Restaurar DUI como NOT NULL
            $table->string('dui', 9)
                ->nullable(false)
                ->change();
        });
    }
};
