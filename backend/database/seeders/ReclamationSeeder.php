<?php

namespace Database\Seeders;

use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReclamationSeeder extends Seeder
{
    public function run(): void
    {
        $citoyens    = User::role('CITOYEN')->get();
        $techniciens = User::role('TECHNICIEN')->get();

        if ($citoyens->isEmpty()) {
            $this->command->warn('Aucun citoyen trouvé. Lance RolePermissionSeeder d\'abord.');
            return;
        }

        Reclamation::factory()
            ->count(30)
            ->state(function () use ($citoyens, $techniciens) {
                return [
                    'user_id'       => $citoyens->random()->id,
                    'technicien_id' => fake()->boolean(60) && $techniciens->isNotEmpty()
                        ? $techniciens->random()->id
                        : null,
                ];
            })
            ->create();
    }
}