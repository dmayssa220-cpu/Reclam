<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReclamationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KpiController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UploadController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/reclamations',              [ReclamationController::class, 'index']);
    Route::post('/reclamations',             [ReclamationController::class, 'store']);
    Route::get('/reclamations/{reclamation}', [ReclamationController::class, 'show']);
    Route::put('/reclamations/{reclamation}', [ReclamationController::class, 'update']);
    Route::delete('/reclamations/{reclamation}', [ReclamationController::class, 'destroy'])
        ->middleware('role:ADMIN');

  
    Route::patch('/reclamations/{reclamation}/statut',
        [ReclamationController::class, 'updateStatut']);

    
    Route::patch('/reclamations/{reclamation}/assign-supervisor',
        [ReclamationController::class, 'assignSupervisor'])
        ->middleware('permission:assign-supervisor');

 
    Route::patch('/reclamations/{reclamation}/assign-technician',
        [ReclamationController::class, 'assignTechnician'])
        ->middleware('permission:assign-technician');

  
    Route::patch('/reclamations/{reclamation}/demarrer',
        [ReclamationController::class, 'demarrerIntervention']);

    
    Route::patch('/reclamations/{reclamation}/resolve',
        [ReclamationController::class, 'resolve'])
        ->middleware('permission:resolve-reclamation');


    Route::patch('/reclamations/{reclamation}/validate',
        [ReclamationController::class, 'validateReclamation'])
        ->middleware('permission:validate-reclamation');

   
    Route::patch('/reclamations/{reclamation}/reject',
        [ReclamationController::class, 'reject'])
        ->middleware('permission:reject-reclamation');

   
    Route::patch('/reclamations/{reclamation}/reopen',
        [ReclamationController::class, 'reopen'])
        ->middleware('permission:reopen-reclamation');


    Route::post('/reclamations/{reclamation}/comment',
        [ReclamationController::class, 'addComment']);
    Route::get('/reclamations/recurrences',        [ReclamationController::class, 'recurrences']);
Route::get('/reclamations/recurrence-groups',  [ReclamationController::class, 'recurrenceGroups']);    

    Route::prefix('notifications')->group(function () {
    Route::get('/',              [NotificationController::class, 'index']);
    Route::get('/unread-count',  [NotificationController::class, 'unreadCount']);
    Route::post('/{id}/read',    [NotificationController::class, 'markAsRead']);
    Route::post('/read-all',     [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}',       [NotificationController::class, 'destroy']);
});
Route::prefix('dashboard')->group(function () {
    Route::get('/kpi',              [DashboardController::class, 'kpi']);
    Route::get('/critiques',        [KpiController::class, 'critiquesEnCours']);
    Route::get('/export',           [KpiController::class, 'export']);
}); 
Route::get('/users/superviseurs',         [UserController::class, 'superviseurs']);
    Route::get('/users/techniciens',          [UserController::class, 'techniciens']);
    Route::get('/users/techniciens/charge',   [UserController::class, 'chargeTechniciens']);   
    Route::post('/uploads', [UploadController::class, 'store']);
    Route::delete('/uploads', [UploadController::class, 'destroy']);

    });