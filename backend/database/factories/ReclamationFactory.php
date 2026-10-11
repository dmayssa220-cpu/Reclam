<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReclamationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'titre'       => 'Fuite ' . fake()->randomElement(['canalisation', 'compteur', 'vanne', 'tuyau']),
            'description' => fake()->paragraph(),
            'adresse'     => fake()->address(),
            'latitude'    => fake()->latitude(33.5, 37.5),  
            'longitude'   => fake()->longitude(7.5, 11.5),
            'zone'        => fake()->randomElement(['Centre', 'Nord', 'Sud', 'Est', 'Ouest']),
            'gravite'     => fake()->randomElement(['faible', 'moyenne', 'critique']),
            'statut'      => 'NOUVEAU',
        ];
    }
}