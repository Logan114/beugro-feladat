<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Balazs',
            'email' => 'kepirobalazs@example.com',
            'password' => Hash::make('password123'), 
        ]);
    }
}
