<?php

namespace Database\Seeders;

use App\Models\Owner;
use App\Models\WaterConnection;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class LegacyWaterConnectionSeeder extends Seeder
{
    /**
     * Seeder para crear pajas de agua legacy (datos históricos pre-2025).
     * 
     * Simula pajas creadas entre 2010-2024 con diferentes estados de pago
     * para verificar el funcionamiento del sistema de billing híbrido que
     * inicia cobro desde 2025-01-01 para pajas legacy.
     */
    public function run(): void
    {
        $owners = Owner::all();

        if ($owners->isEmpty()) {
            $this->command->warn('No hay propietarios registrados. Ejecuta primero OwnerSeeder.');
            return;
        }

        // Preguntar si desea limpiar las pajas existentes
        if (WaterConnection::count() > 0) {
            if ($this->command->confirm('Ya existen pajas de agua en la base de datos. ¿Desea eliminarlas todas antes de crear las legacy?', false)) {
                WaterConnection::truncate();
                $this->command->info('✓ Pajas de agua eliminadas.');
            }
        }

        // Obtener el último código usado para continuar la numeración
        $lastConnection = WaterConnection::orderBy('code', 'desc')->first();
        $counter = 1001;
        
        if ($lastConnection) {
            // Extraer el número del código (WC-00123 -> 123)
            $lastCode = intval(substr($lastConnection->code, 3));
            $counter = $lastCode + 1;
            $this->command->info("Continuando numeración desde WC-" . str_pad($counter, 5, '0', STR_PAD_LEFT));
        }

        $communities = Owner::COMMUNITIES;
        $statuses = WaterConnection::STATUSES;
        
        $locations = [
            'Casa frente al parque central',
            'Avenida principal, sector norte',
            'Calle secundaria, casa #23',
            'Barrio El Progreso, casa #67',
            'Frente a la iglesia católica',
            'Al lado del centro comunal',
            'Calle Los Robles, casa esquinera',
            'Residencial Santa Ana, lote 8',
            'Camino rural, km 2.5',
            'Casa junto al molino de maíz',
        ];

        $comments = [
            'Paja instalada antes de 2025 - datos históricos',
            'Conexión legacy migrada del sistema anterior',
            'Cliente antiguo - más de 10 años de servicio',
            null,
            'Requiere actualización de datos',
            null,
        ];

        $usedNumbersByCommunity = [];
        
        // Datos legacy para simular diferentes escenarios
        $legacyScenarios = [
            // Escenario 1: Pajas muy antiguas (2010-2015) - 14 años atrás
            ['start_year' => 2010, 'end_year' => 2015, 'count' => 8, 'description' => 'muy antigua'],
            
            // Escenario 2: Pajas antiguas (2016-2020) - 5-9 años atrás
            ['start_year' => 2016, 'end_year' => 2020, 'count' => 10, 'description' => 'antigua'],
            
            // Escenario 3: Pajas recientes pre-2025 (2021-2024)
            ['start_year' => 2021, 'end_year' => 2024, 'count' => 12, 'description' => 'reciente pre-2025'],
        ];

        $this->command->info('Creando pajas de agua legacy...');
        
        foreach ($legacyScenarios as $scenario) {
            $this->command->info("Creando {$scenario['count']} pajas {$scenario['description']} ({$scenario['start_year']}-{$scenario['end_year']})...");
            
            for ($i = 0; $i < $scenario['count']; $i++) {
                $community = $communities[array_rand($communities)];
                $communityOwners = $owners->where('community', $community);
                
                if ($communityOwners->isEmpty()) {
                    continue;
                }
                
                $owner = $communityOwners->random();
                
                // Generar número único para esta comunidad
                if (!isset($usedNumbersByCommunity[$community])) {
                    $usedNumbersByCommunity[$community] = [];
                }
                
                do {
                    $ownerNumber = rand(1, 999);
                } while (in_array($ownerNumber, $usedNumbersByCommunity[$community]));
                
                $usedNumbersByCommunity[$community][] = $ownerNumber;
                
                // Generar fecha de creación aleatoria dentro del rango del escenario
                $year = rand($scenario['start_year'], $scenario['end_year']);
                $month = rand(1, 12);
                $day = rand(1, 28); // Usar 28 para evitar problemas con febrero
                $createdAt = Carbon::create($year, $month, $day, rand(8, 18), rand(0, 59));
                
                // Distribuir estados de pago de forma realista para pajas legacy
                $paymentStatusOptions = [];
                $rand = rand(1, 100);
                
                if ($rand <= 20) {
                    // 20% - Al día (clientes que pagan puntualmente)
                    $paymentStatusOptions = ['al_dia'];
                } elseif ($rand <= 50) {
                    // 30% - En mora mensual (común en pajas legacy)
                    $paymentStatusOptions = ['en_mora'];
                } elseif ($rand <= 65) {
                    // 15% - En mora + mora medidor
                    $paymentStatusOptions = ['en_mora', 'en_mora_medidor'];
                } elseif ($rand <= 78) {
                    // 13% - En mora + mora instalación
                    $paymentStatusOptions = ['en_mora', 'en_mora_instalacion'];
                } elseif ($rand <= 88) {
                    // 10% - Solo mora medidor
                    $paymentStatusOptions = ['en_mora_medidor'];
                } elseif ($rand <= 94) {
                    // 6% - Todas las moras (casos problemáticos)
                    $paymentStatusOptions = ['en_mora', 'en_mora_medidor', 'en_mora_instalacion'];
                } elseif ($rand <= 98) {
                    // 4% - Mora medidor + instalación
                    $paymentStatusOptions = ['en_mora_medidor', 'en_mora_instalacion'];
                } else {
                    // 2% - Solo mora instalación
                    $paymentStatusOptions = ['en_mora_instalacion'];
                }
                
                // Status de la paja - más probabilidad de activa para pajas legacy
                $status = rand(1, 100) <= 85 ? 'activa' : $statuses[array_rand($statuses)];
                
                $waterConnection = WaterConnection::create([
                    'code' => 'WC-' . str_pad($counter, 5, '0', STR_PAD_LEFT),
                    'owner_number' => $ownerNumber,
                    'owner_id' => $owner->id,
                    'community' => $community,
                    'location_description' => $locations[array_rand($locations)],
                    'status' => $status,
                    'payment_status' => $paymentStatusOptions,
                    'comments' => $comments[array_rand($comments)],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
                
                $counter++;
            }
        }
        
        // Crear algunas pajas de 2025 para contrastar con las legacy
        $this->command->info('Creando pajas nuevas de 2025 (post sistema de billing)...');
        
        for ($i = 0; $i < 5; $i++) {
            $community = $communities[array_rand($communities)];
            $communityOwners = $owners->where('community', $community);
            
            if ($communityOwners->isEmpty()) {
                continue;
            }
            
            $owner = $communityOwners->random();
            
            if (!isset($usedNumbersByCommunity[$community])) {
                $usedNumbersByCommunity[$community] = [];
            }
            
            do {
                $ownerNumber = rand(1, 999);
            } while (in_array($ownerNumber, $usedNumbersByCommunity[$community]));
            
            $usedNumbersByCommunity[$community][] = $ownerNumber;
            
            // Fechas de 2025 (después del inicio del sistema de billing)
            $createdAt = Carbon::create(2025, rand(1, 11), rand(1, 28), rand(8, 18), rand(0, 59));
            
            // Pajas nuevas tienen menos probabilidad de estar en mora
            $rand = rand(1, 100);
            if ($rand <= 60) {
                $paymentStatusOptions = ['al_dia'];
            } elseif ($rand <= 85) {
                $paymentStatusOptions = ['en_mora'];
            } else {
                $paymentStatusOptions = ['en_mora', 'en_mora_medidor'];
            }
            
            WaterConnection::create([
                'code' => 'WC-' . str_pad($counter, 5, '0', STR_PAD_LEFT),
                'owner_number' => $ownerNumber,
                'owner_id' => $owner->id,
                'community' => $community,
                'location_description' => $locations[array_rand($locations)],
                'status' => 'activa',
                'payment_status' => $paymentStatusOptions,
                'comments' => 'Paja creada en 2025 - nueva instalación',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
            
            $counter++;
        }

        $totalCreated = $counter - ($lastConnection ? intval(substr($lastConnection->code, 3)) + 1 : 1001);
        $this->command->info("✓ Se crearon {$totalCreated} pajas de agua legacy para pruebas.");
        $this->command->info('  • 30 pajas con created_at < 2025-01-01 (deberían cobrar desde 2025-01-01)');
        $this->command->info('  • 5 pajas con created_at >= 2025-01-01 (deberían cobrar desde su created_at)');
        $this->command->newLine();
        $this->command->warn('VERIFICAR:');
        $this->command->warn('  1. Pajas legacy (2010-2024) deben mostrar meses pendientes desde Enero 2025');
        $this->command->warn('  2. Pajas nuevas (2025) deben mostrar meses pendientes desde su fecha de creación');
        $this->command->warn('  3. Estados de pago deben mostrarse correctamente con PaymentStatusBadge');
    }
}
