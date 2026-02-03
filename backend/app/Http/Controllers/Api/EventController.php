<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->events; 
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
            'time' => 'required',
            'description' => 'nullable|string',
        ]);

        $event = $request->user()->events()->create($data);

        return $event;
    }

    public function update(Request $request, $id)
    {
        $event = Event::where('user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'description' => 'required|string',
        ]);

        $event->update($data);

        return $event;
    }

    public function destroy(Request $request, $id)
    {
        $event = Event::where('user_id', $request->user()->id)->findOrFail($id);
        $event->delete();

        return ['message' => 'Event deleted'];
    }
}
