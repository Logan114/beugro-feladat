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
        $admin = User::factory()->create([
            'name' => 'Root',
            'email' => 'root@root.com',
            'password' => Hash::make('root'),
            'is_agent'=>(true),
            
        ]);
        $this->callWith(EventSeeder::class, ['user' => $balazs]);
        $this->callWith(EventSeeder::class, ['user' => $admin]);
    }
}
