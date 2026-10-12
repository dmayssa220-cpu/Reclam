<?php

namespace Tests\Feature;

use App\Models\Reclamation;
use App\Models\User;
use App\Notifications\ReclamationCreatedNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_creating_reclamation_notifies_superviseurs_and_admins(): void
    {
        Notification::fake();

        $citoyen     = User::factory()->create();
        $citoyen->assignRole('CITOYEN');
        $superviseur = User::factory()->create(['zone' => 'Centre']);
        $superviseur->assignRole('SUPERVISEUR');
        $admin       = User::factory()->create();
        $admin->assignRole('ADMIN');

        $citoyen->createToken('test');

        $this->actingAs($citoyen, 'sanctum')
            ->postJson('/api/reclamations', [
                'titre'       => 'Fuite test',
                'description' => 'Une fuite importante dans la rue principale.',
                'zone'        => 'Centre',
                'gravite'     => 'moyenne',
            ])
            ->assertCreated();

        Notification::assertSentTo($superviseur, ReclamationCreatedNotification::class);
        Notification::assertSentTo($admin,       ReclamationCreatedNotification::class);
    }

    public function test_unread_count_endpoint(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('ADMIN');

        $rec = Reclamation::factory()->create([
            'reference' => 'REC-TEST-UNREAD',
        ]);
        $admin->notifications()->delete();
        $admin->notify(new ReclamationCreatedNotification($rec));

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJson(['count' => 1]);
    }
}