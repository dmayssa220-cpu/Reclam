<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReclamationController;
use App\Http\Controllers\Api\NotificationController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/reclamations',              [ReclamationController::class, 'index']);
    Route::post('/reclamations',             [ReclamationController::class, 'store']);
    Route::get('/reclamations/{reclamation}', [ReclamationController::class, 'show']);
    Route::put('/reclamations/{reclamation}', [ReclamationController::class, 'update']);    
    Route::patch('/reclamations/{reclamation}/statut',
        [ReclamationController::class, 'updateStatut']);
    Route::patch('/reclamations/{reclamation}/assign',
        [ReclamationController::class, 'assign'])
        ->middleware('permission:assign-reclamation');    
    Route::delete('/reclamations/{reclamation}',
        [ReclamationController::class, 'destroy'])
        ->middleware('role:ADMIN');
    Route::prefix('notifications')->group(function () {
    Route::get('/',              [NotificationController::class, 'index']);
    Route::get('/unread-count',  [NotificationController::class, 'unreadCount']);
    Route::post('/{id}/read',    [NotificationController::class, 'markAsRead']);
    Route::post('/read-all',     [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}',       [NotificationController::class, 'destroy']);
});    
});