<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Create Alice
        User::create([
            'name' => 'Balazs',
            'email' => 'alice@example.com',
            'password' => Hash::make('password123'), 
        ]);
    }
}
