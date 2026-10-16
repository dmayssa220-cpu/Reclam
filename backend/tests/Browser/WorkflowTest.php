<?php

use App\Models\User;
use App\Models\Reclamation;
use Database\Seeders\RolePermissionSeeder;

it('completes the full workflow from assignment to validation', function () {
    $this->seed(RolePermissionSeeder::class);

    $admin = User::where('email', 'admin@waterleaks.local')->first();
    $superviseur = User::where('email', 'superviseur@waterleaks.local')->first();
    $technicien = User::where('email', 'technicien@waterleaks.local')->first();
    $citoyen = User::where('email', 'citoyen@waterleaks.local')->first();

    $reclamation = Reclamation::create([
        'user_id' => $citoyen->id,
        'titre' => 'Fuite test E2E',
        'description' => 'Description pour test de bout en bout.',
        'gravite' => 'moyenne',
        'statut' => 'NOUVEAU',
    ]);

   
    $this->actingAs($admin)
        ->patchJson("/api/reclamations/{$reclamation->id}/assign-supervisor", [
            'superviseur_id' => $superviseur->id,
        ])
        ->assertOk()
        ->assertJsonPath('statut', 'ASSIGNE');

   
    $this->actingAs($superviseur)
        ->patchJson("/api/reclamations/{$reclamation->id}/assign-technician", [
            'technicien_id' => $technicien->id,
        ])
        ->assertOk();

   
    $this->actingAs($technicien)
        ->patchJson("/api/reclamations/{$reclamation->id}/resolve", [
            'preuve_commentaire' => 'Fuite colmatée, joint remplacé.',
            'duree_intervention' => 45,
        ])
        ->assertOk()
        ->assertJsonPath('statut', 'A_VALIDER');

  
    $this->actingAs($superviseur)
        ->patchJson("/api/reclamations/{$reclamation->id}/validate", [
            'commentaire' => 'Travail conforme.',
        ])
        ->assertOk()
        ->assertJsonPath('statut', 'CLOTURE');
});

it('renders the login page without javascript errors', function () {
    $this->get('/login')->assertOk();
})->skip('Frontend séparé');