<?php

namespace Database\Seeders;

use App\Models\Owner;
use Illuminate\Database\Seeder;

class OwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ownersData = [
            // La Pandeadura
            [
                'name' => 'María González Pérez',
                'dui' => '012345671',
                'phone' => '72345678',
                'address' => 'Calle Principal, Casa #12, La Pandeadura',
                'community' => 'La Pandeadura',
            ],
            [
                'name' => 'José Ramírez López',
                'dui' => '012345672',
                'phone' => '72345679',
                'address' => 'Barrio El Centro, La Pandeadura',
                'community' => 'La Pandeadura',
            ],
            [
                'name' => 'Ana Martínez Cruz',
                'dui' => '012345673',
                'phone' => '72345680',
                'address' => 'Calle Los Laureles, La Pandeadura',
                'community' => 'La Pandeadura',
            ],

            // La Puerta
            [
                'name' => 'Carlos Hernández García',
                'dui' => '023456781',
                'phone' => '73456789',
                'address' => 'Avenida Central, Casa #25, La Puerta',
                'community' => 'La Puerta',
            ],
            [
                'name' => 'Rosa Flores Mendoza',
                'dui' => '023456782',
                'phone' => '73456790',
                'address' => 'Colonia San José, La Puerta',
                'community' => 'La Puerta',
            ],
            [
                'name' => 'Pedro Gómez Reyes',
                'dui' => '023456783',
                'phone' => '73456791',
                'address' => 'Barrio La Esperanza, La Puerta',
                'community' => 'La Puerta',
            ],

            // Loma Larga
            [
                'name' => 'Sandra Morales Vásquez',
                'dui' => '034567891',
                'phone' => '74567890',
                'address' => 'Calle El Progreso, Loma Larga',
                'community' => 'Loma Larga',
            ],
            [
                'name' => 'Miguel Ángel Torres',
                'dui' => '034567892',
                'phone' => '74567891',
                'address' => 'Avenida Las Flores, Casa #8, Loma Larga',
                'community' => 'Loma Larga',
            ],
            [
                'name' => 'Elena Castillo Ruiz',
                'dui' => '034567893',
                'phone' => '74567892',
                'address' => 'Colonia Vista Hermosa, Loma Larga',
                'community' => 'Loma Larga',
            ],

            // Rodeo 1
            [
                'name' => 'Francisco Mejía Santos',
                'dui' => '045678901',
                'phone' => '75678901',
                'address' => 'Barrio San Antonio, Rodeo 1',
                'community' => 'Rodeo 1',
            ],
            [
                'name' => 'Claudia Ramos Díaz',
                'dui' => '045678902',
                'phone' => '75678902',
                'address' => 'Calle Principal, Casa #45, Rodeo 1',
                'community' => 'Rodeo 1',
            ],
            [
                'name' => 'Roberto Pérez Chávez',
                'dui' => '045678903',
                'phone' => '75678903',
                'address' => 'Avenida Los Pinos, Rodeo 1',
                'community' => 'Rodeo 1',
            ],

            // Rodeo 2
            [
                'name' => 'Beatriz Ortiz Campos',
                'dui' => '056789012',
                'phone' => '76789012',
                'address' => 'Colonia El Rosario, Rodeo 2',
                'community' => 'Rodeo 2',
            ],
            [
                'name' => 'Jorge Luis Medina',
                'dui' => '056789013',
                'phone' => '76789013',
                'address' => 'Calle Las Acacias, Casa #33, Rodeo 2',
                'community' => 'Rodeo 2',
            ],
            [
                'name' => 'Patricia Guzmán Rivera',
                'dui' => '056789014',
                'phone' => '76789014',
                'address' => 'Barrio La Paz, Rodeo 2',
                'community' => 'Rodeo 2',
            ],

            // San Francisco
            [
                'name' => 'Antonio Silva Moreno',
                'dui' => '067890123',
                'phone' => '77890123',
                'address' => 'Avenida Central, Casa #17, San Francisco',
                'community' => 'San Francisco',
            ],
            [
                'name' => 'Gloria Campos Núñez',
                'dui' => '067890124',
                'phone' => '77890124',
                'address' => 'Calle El Carmen, San Francisco',
                'community' => 'San Francisco',
            ],
            [
                'name' => 'Luis Alberto Aguilar',
                'dui' => '067890125',
                'phone' => '77890125',
                'address' => 'Colonia Santa Rosa, San Francisco',
                'community' => 'San Francisco',
            ],

            // San Rafael
            [
                'name' => 'Carmen Velásquez León',
                'dui' => '078901234',
                'phone' => '78901234',
                'address' => 'Barrio El Centro, Casa #22, San Rafael',
                'community' => 'San Rafael',
            ],
            [
                'name' => 'Rodrigo Benítez Sosa',
                'dui' => '078901235',
                'phone' => '78901235',
                'address' => 'Calle Los Almendros, San Rafael',
                'community' => 'San Rafael',
            ],
            [
                'name' => 'Gabriela Navarro Cruz',
                'dui' => '078901236',
                'phone' => '78901236',
                'address' => 'Avenida La Libertad, San Rafael',
                'community' => 'San Rafael',
            ],

            // San Rafael (Los Pinos)
            [
                'name' => 'Fernando Jiménez Paz',
                'dui' => '089012345',
                'phone' => '79012345',
                'address' => 'Colonia Los Pinos, Casa #5, San Rafael',
                'community' => 'San Rafael (Los Pinos)',
            ],
            [
                'name' => 'Silvia Herrera Ochoa',
                'dui' => '089012346',
                'phone' => '79012346',
                'address' => 'Calle Principal, Los Pinos, San Rafael',
                'community' => 'San Rafael (Los Pinos)',
            ],
            [
                'name' => 'Héctor Montes Durán',
                'dui' => '089012347',
                'phone' => '79012347',
                'address' => 'Barrio Nuevo, Los Pinos, San Rafael',
                'community' => 'San Rafael (Los Pinos)',
            ],
        ];

        foreach ($ownersData as $ownerData) {
            Owner::create($ownerData);
        }
    }
}
