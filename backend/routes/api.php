<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\SupportChatController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
Route::post('/login', [AuthController::class, 'login']);
Route::post('/resetpassword', [PasswordResetLinkController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chat', [ChatController::class, 'handle']);
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/agent/chats', [SupportChatController::class, 'index']);
    Route::post('/agent/chats/{id}/reply', [SupportChatController::class, 'reply']);
    Route::get('/support/chats/{id}', [SupportChatController::class, 'show']);
    Route::post('/support/chats/{id}/message', [SupportChatController::class, 'userMessage']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
