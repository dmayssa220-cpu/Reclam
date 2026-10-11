<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_login_returns_permissions_inherited_from_the_users_role(): void
    {
        $user = User::factory()->create([
            'email' => 'citoyen@example.com',
            'password' => 'password',
        ]);
        $user->assignRole('CITOYEN');

        $this->postJson('/api/login', [
            'email' => 'citoyen@example.com',
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonFragment(['name' => 'create-reclamation']);
    }

    public function test_logout_succeeds_without_a_valid_token(): void
    {
        $this->withToken('invalid-token')
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJson(['message' => 'Déconnecté']);
    }

    public function test_logout_revokes_the_current_access_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
