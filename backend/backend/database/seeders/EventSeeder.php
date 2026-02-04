<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run($user): void
    {
        // Create events linked to the user
        Event::create([
            'user_id' => $user->id,
            'name'    => 'Example Event',
            'date'    => '2026-05-24',
            'time'    => '10:30:00',
        ]);

    }
}
