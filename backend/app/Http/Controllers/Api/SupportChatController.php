<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupportChatStore;
use Illuminate\Http\Request;

class SupportChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || ! $user->is_agent) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $store = new SupportChatStore();
        return response()->json([
            'chats' => $store->all(),
        ]);
    }

    public function reply(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user || ! $user->is_agent) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $store = new SupportChatStore();
        $updated = $store->addReply($id, [
            'message' => $request->input('message'),
            'agent_name' => $user->name,
            'created_at' => now()->toIso8601String(),
        ]);

        if (! $updated) {
            return response()->json(['message' => 'Chat not found'], 404);
        }

        return response()->json([
            'chat' => $updated,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $store = new SupportChatStore();
        $chat = $store->find($id);

        if (! $chat) {
            return response()->json(['message' => 'Chat not found'], 404);
        }

        if (! $user->is_agent && isset($chat['user_id']) && $chat['user_id'] !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'chat' => $chat,
        ]);
    }

    public function userMessage(Request $request, string $id)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $store = new SupportChatStore();
        $chat = $store->find($id);

        if (! $chat) {
            return response()->json(['message' => 'Chat not found'], 404);
        }

        if (! $user->is_agent && isset($chat['user_id']) && $chat['user_id'] !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $updated = $store->addUserMessage($id, [
            'message' => $request->input('message'),
            'user_name' => $user->name,
            'created_at' => now()->toIso8601String(),
        ]);

        if (! $updated) {
            return response()->json(['message' => 'Chat not found'], 404);
        }

        return response()->json([
            'chat' => $updated,
        ]);
    }
}
