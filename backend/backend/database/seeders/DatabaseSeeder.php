<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $balazs = User::factory()->create([
            'name' => 'Balázs',
            'email' => 'kepirobalazs204@gmail.com',
        ]);
        $this->callWith(EventSeeder::class, ['user' => $balazs]);
    }
}
