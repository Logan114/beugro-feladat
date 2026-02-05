<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $balazs = User::factory()->create([
            'name' => 'Balázs',
            'email' => 'kepirobalazs@example.com',
            'password' => Hash::make('password123'),
            
        ]);
        $this->callWith(EventSeeder::class, ['user' => $balazs]);
    }
}
