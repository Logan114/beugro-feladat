<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class SupportChatStore
{
    private string $path = 'support_chats.json';

    public function all(): array
    {
        if (! Storage::exists($this->path)) {
            return [];
        }

        $raw = Storage::get($this->path);
        $data = json_decode($raw, true);

        return is_array($data) ? $data : [];
    }

    public function append(array $chat): void
    {
        $chats = $this->all();
        $chats[] = $chat;
        $this->write($chats);
    }

    public function find(string $id): ?array
    {
        $chats = $this->all();

        foreach ($chats as $chat) {
            if (($chat['id'] ?? null) === $id) {
                return $chat;
            }
        }

        return null;
    }

    public function addReply(string $id, array $reply): ?array
    {
        $chats = $this->all();
        $updated = null;

        foreach ($chats as &$chat) {
            if (($chat['id'] ?? null) !== $id) {
                continue;
            }

            $chat['agent_replies'] = $chat['agent_replies'] ?? [];
            $chat['agent_replies'][] = $reply;
            $chat['status'] = 'answered';
            $updated = $chat;
            break;
        }

        if ($updated !== null) {
            $this->write($chats);
        }

        return $updated;
    }

    public function addUserMessage(string $id, array $message): ?array
    {
        $chats = $this->all();
        $updated = null;

        foreach ($chats as &$chat) {
            if (($chat['id'] ?? null) !== $id) {
                continue;
            }

            $chat['user_messages'] = $chat['user_messages'] ?? [];
            $chat['user_messages'][] = $message;
            $chat['status'] = 'pending';
            $updated = $chat;
            break;
        }

        if ($updated !== null) {
            $this->write($chats);
        }

        return $updated;
    }

    private function write(array $chats): void
    {
        Storage::put($this->path, json_encode($chats, JSON_PRETTY_PRINT));
    }
}
