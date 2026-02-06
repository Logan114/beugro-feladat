<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\SupportChatStore;

class ChatController extends Controller
{
    public function handle(Request $request)
    {
        $message = $request->input('message');

        $lowerMessage = strtolower($message ?? '');
        if (str_contains($lowerMessage, 'human') || str_contains($lowerMessage, 'ember')) {
            $store = new SupportChatStore();
            $chatId = uniqid('chat_', true);
            $user = $request->user();
            $store->append([
                'id' => $chatId,
                'user_id' => $user?->id,
                'user_message' => $message,
                'user_messages' => [],
                'created_at' => now()->toIso8601String(),
                'status' => 'pending',
                'agent_replies' => [],
            ]);

            return response()->json([
                'type' => 'handoff',
                'chat_id' => $chatId,
                'reply' => 'An agent will be with you shortly'
            ]);
        }

        $script = Storage::exists('Agent.txt') ? Storage::get('Agent.txt') : '';

        $messages = [
            ["role" => "system", "content" => $script],
            ["role" => "user", "content" => $message]
        ];

        try {
            $response = Http::withToken(env('HF_TOKEN'))
            ->post('https://router.huggingface.co/v1/chat/completions', [
                "model" => "Qwen/Qwen3-Coder-Next:novita",
                "messages" => $messages,
                "stream" => false
            ]);

            Log::info('HF response', ['status' => $response->status(), 'body' => $response->body()]);

            $data = $response->json();

            return response()->json([
                'type' => 'ai',
                'reply' => $data['choices'][0]['message']['content'] ?? 'Something went wrong'
            ]);
        } catch (\Exception $e) {
            Log::error('HF request failed', ['error' => $e->getMessage()]);
            return response()->json([
                'type' => 'error',
                'reply' => 'AI request failed: ' . $e->getMessage()
            ]);
        }
    }
}
