<?php

namespace Database\Seeders;

use App\Models\Owner;
use App\Models\WaterConnection;
use Illuminate\Database\Seeder;

class WaterConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener todos los propietarios activos
        $owners = Owner::all();

        if ($owners->isEmpty()) {
            $this->command->warn('No hay propietarios registrados. Ejecuta primero OwnerSeeder.');
            return;
        }

        $communities = Owner::COMMUNITIES;
        $statuses = WaterConnection::STATUSES;
        $paymentStatuses = WaterConnection::PAYMENT_STATUSES;
        
        $locations = [
            'Casa frente al parque central',
            'Avenida principal, sector norte',
            'Calle secundaria, cerca de la escuela',
            'Barrio El Progreso, casa #45',
            'Frente a la cancha deportiva',
            'Al lado del centro de salud',
            'Calle Los Pinos, última casa',
            'Residencial Las Flores, lote 12',
        ];

        $comments = [
            null,
            null,
            'Paja instalada recientemente',
            'Requiere revisión de tubería',
            'Propietario solicitó cambio de medidor',
            null,
            'Conexión compartida con casa vecina',
        ];

        $counter = 1;
        $usedNumbersByCommunity = [];
        
        // Crear 5-8 pajas por comunidad distribuidas entre diferentes propietarios
        foreach ($communities as $community) {
            $communityOwners = $owners->where('community', $community);
            
            if ($communityOwners->isEmpty()) {
                continue;
            }

            // Inicializar array para esta comunidad
            if (!isset($usedNumbersByCommunity[$community])) {
                $usedNumbersByCommunity[$community] = [];
            }

            $pajasCount = rand(5, 8);
            
            for ($i = 0; $i < $pajasCount; $i++) {
                $owner = $communityOwners->random();
                
                // Generar número único para esta comunidad
                do {
                    $ownerNumber = rand(1, 999);
                } while (in_array($ownerNumber, $usedNumbersByCommunity[$community]));
                
                $usedNumbersByCommunity[$community][] = $ownerNumber;
                
                // Generar estados de pago combinados (excepto 'al_dia' que es exclusivo)
                $paymentStatusOptions = [];
                $rand = rand(1, 100);
                
                if ($rand <= 40) {
                    // 40% - Al día (exclusivo)
                    $paymentStatusOptions = ['al_dia'];
                } elseif ($rand <= 60) {
                    // 20% - Solo en mora
                    $paymentStatusOptions = ['en_mora'];
                } elseif ($rand <= 75) {
                    // 15% - En mora + mora medidor
                    $paymentStatusOptions = ['en_mora', 'en_mora_medidor'];
                } elseif ($rand <= 85) {
                    // 10% - En mora + mora instalación
                    $paymentStatusOptions = ['en_mora', 'en_mora_instalacion'];
                } elseif ($rand <= 92) {
                    // 7% - Solo mora medidor
                    $paymentStatusOptions = ['en_mora_medidor'];
                } elseif ($rand <= 97) {
                    // 5% - Todas las moras
                    $paymentStatusOptions = ['en_mora', 'en_mora_medidor', 'en_mora_instalacion'];
                } else {
                    // 3% - Mora medidor + instalación
                    $paymentStatusOptions = ['en_mora_medidor', 'en_mora_instalacion'];
                }
                
                WaterConnection::create([
                    'code' => 'WC-' . str_pad($counter, 5, '0', STR_PAD_LEFT),
                    'owner_number' => $ownerNumber,
                    'owner_id' => $owner->id,
                    'community' => $community,
                    'location_description' => $locations[array_rand($locations)],
                    'status' => $statuses[array_rand($statuses)],
                    'payment_status' => $paymentStatusOptions,
                    'comments' => $comments[array_rand($comments)],
                ]);
                
                $counter++;
            }
        }

        $this->command->info('Se crearon ' . ($counter - 1) . ' pajas de agua de prueba.');
    }
}
