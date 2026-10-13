<?php

namespace Tests\Feature;

use App\Models\Reclamation;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReclamationFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_active_status_filter_excludes_closed_reclamations(): void
    {
        Notification::fake();

        $admin = User::role('ADMIN')->firstOrFail();

        $active = Reclamation::factory()->create([
            'reference' => 'REC-ACTIVE-01',
            'gravite' => 'critique',
            'statut' => 'ASSIGNE',
        ]);

        Reclamation::factory()->create([
            'reference' => 'REC-CLOSED-01',
            'gravite' => 'critique',
            'statut' => 'RESOLU',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/reclamations?gravite=critique&statut=actives')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $active->id);
    }
}
