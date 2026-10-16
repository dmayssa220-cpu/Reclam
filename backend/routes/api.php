<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReclamationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KpiController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\IaController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');
Route::middleware(['auth:sanctum', 'role:ADMIN'])->prefix('admin')->group(function () {
    Route::apiResource('users', AdminUserController::class);
    Route::patch('users/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);
});
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
Route::prefix('ia')->group(function () {
    Route::get('/health',                    [IaController::class, 'health']);
    Route::post('/analyze/{reclamation}',    [IaController::class, 'analyze']);
    Route::get('/recurrence/{reclamation}',  [IaController::class, 'predictRecurrence']);
});
Route::get('/users/superviseurs',   [UserController::class, 'superviseurs']);
    Route::get('/users/techniciens', [UserController::class, 'techniciens']);
    Route::get('/users/techniciens/charge',[UserController::class, 'chargeTechniciens']);
    Route::post('/uploads', [UploadController::class, 'store']);
    Route::delete('/uploads', [UploadController::class, 'destroy']);

});