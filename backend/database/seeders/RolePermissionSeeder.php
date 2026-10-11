<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'create-reclamation',
            'view-reclamations',
            'view-own-reclamations',
            'update-reclamation',
            'assign-reclamation',
            'close-reclamation',
            'view-kpi',
            'view-map',
            'manage-users',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        $admin = Role::firstOrCreate(['name' => 'ADMIN']);
        $superviseur = Role::firstOrCreate(['name' => 'SUPERVISEUR']);
        $technicien = Role::firstOrCreate(['name' => 'TECHNICIEN']);
        $citoyen = Role::firstOrCreate(['name' => 'CITOYEN']);
        $analyste = Role::firstOrCreate(['name' => 'ANALYSTE']);

        $admin->syncPermissions(Permission::all());
        $superviseur->syncPermissions([
            'view-reclamations', 'update-reclamation',
            'assign-reclamation', 'close-reclamation',
            'view-kpi', 'view-map',
        ]);
        $technicien->syncPermissions([
            'view-reclamations', 'update-reclamation', 'view-map',
        ]);
        $citoyen->syncPermissions([
            'create-reclamation', 'view-own-reclamations',
        ]);
        $analyste->syncPermissions([
            'view-reclamations', 'view-kpi', 'view-map',
        ]);

        // Utilisateur admin par défaut
        $user = User::firstOrCreate(
            ['email' => 'admin@waterleaks.local'],
            ['name' => 'Admin', 'password' => Hash::make('password')]
        );
        $user->assignRole('ADMIN');

        // Utilisateur superviseur de test
        $sup = User::firstOrCreate(
            ['email' => 'superviseur@waterleaks.local'],
            ['name' => 'Superviseur', 'password' => Hash::make('password'), 'zone' => 'Centre']
        );
        $sup->assignRole('SUPERVISEUR');

        // Technicien
        $tech = User::firstOrCreate(
            ['email' => 'technicien@waterleaks.local'],
            ['name' => 'Technicien', 'password' => Hash::make('password'), 'zone' => 'Centre']
        );
        $tech->assignRole('TECHNICIEN');

        // Citoyen
        $cit = User::firstOrCreate(
            ['email' => 'citoyen@waterleaks.local'],
            ['name' => 'Citoyen', 'password' => Hash::make('password')]
        );
        $cit->assignRole('CITOYEN');
    }
}