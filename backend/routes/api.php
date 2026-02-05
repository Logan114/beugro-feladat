<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
Route::post('/login', [AuthController::class, 'login']);
Route::post('/resetpassword', [PasswordResetLinkController::class, 'store']);
Route::post('/chat', [ChatController::class, 'handle']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
