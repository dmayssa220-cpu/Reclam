<?php

namespace Tests\Feature;

use App\Models\Reclamation;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReclamationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_authenticated_users_can_list_active_supervisors(): void
    {
        $admin = User::where('email', 'admin@waterleaks.local')->firstOrFail();
        $inactiveSupervisor = User::factory()->create();
        $inactiveSupervisor->assignRole('SUPERVISEUR');
        $inactiveSupervisor->forceFill(['is_active' => false])->save();

        $this->actingAs($admin)
            ->getJson('/api/users/superviseurs')
            ->assertOk()
            ->assertJsonFragment(['id' => User::where('email', 'superviseur@waterleaks.local')->value('id')])
            ->assertJsonMissing(['id' => $inactiveSupervisor->id]);
    }

    public function test_supervisor_assignment_technician_resolution_and_validation_work(): void
    {
        $admin = User::where('email', 'admin@waterleaks.local')->firstOrFail();
        $supervisor = User::where('email', 'superviseur@waterleaks.local')->firstOrFail();
        $technician = User::where('email', 'technicien@waterleaks.local')->firstOrFail();
        $citizen = User::where('email', 'citoyen@waterleaks.local')->firstOrFail();

        $reclamation = Reclamation::create([
            'user_id' => $citizen->id,
            'titre' => 'Water leak',
            'description' => 'A leak needs repair.',
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/reclamations/{$reclamation->id}/assign-supervisor", [
                'superviseur_id' => $supervisor->id,
            ])
            ->assertOk()
            ->assertJsonPath('superviseur_id', $supervisor->id);

        $this->actingAs($supervisor)
            ->patchJson("/api/reclamations/{$reclamation->id}/assign-technician", [
                'technicien_id' => $technician->id,
            ])
            ->assertOk()
            ->assertJsonPath('technicien_id', $technician->id);

        $this->actingAs($technician)
            ->patchJson("/api/reclamations/{$reclamation->id}/resolve", [
                'preuve_commentaire' => 'The damaged pipe has been repaired.',
                'duree_intervention' => 45,
            ])
            ->assertOk()
            ->assertJsonPath('statut', 'A_VALIDER');

        $this->actingAs($supervisor)
            ->patchJson("/api/reclamations/{$reclamation->id}/validate", [
                'commentaire' => 'Repair verified.',
            ])
            ->assertOk()
            ->assertJsonPath('statut', 'CLOTURE');
    }
}
