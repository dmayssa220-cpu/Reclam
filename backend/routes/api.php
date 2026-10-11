<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReclamationController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/reclamations',              [ReclamationController::class, 'index']);
    Route::post('/reclamations',             [ReclamationController::class, 'store']);
    Route::get('/reclamations/{reclamation}', [ReclamationController::class, 'show']);
    Route::put('/reclamations/{reclamation}', [ReclamationController::class, 'update']);

    // Workflow
    Route::patch('/reclamations/{reclamation}/statut',
        [ReclamationController::class, 'updateStatut']);

    Route::patch('/reclamations/{reclamation}/assign',
        [ReclamationController::class, 'assign'])
        ->middleware('permission:assign-reclamation');

    // Suppression (ADMIN)
    Route::delete('/reclamations/{reclamation}',
        [ReclamationController::class, 'destroy'])
        ->middleware('role:ADMIN');
});