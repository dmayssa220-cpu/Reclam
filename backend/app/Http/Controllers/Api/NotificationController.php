<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $filtre  = $request->input('filtre', 'all'); // all | unread | read

        $query = $request->user()->notifications();

        if ($filtre === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filtre === 'read') {
            $query->whereNotNull('read_at');
        }

        $paginated = $query->latest()->paginate($perPage);

        return response()->json([
            'data'         => collect($paginated->items())->map(fn ($n) => $this->format($n)),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'per_page'     => $paginated->perPage(),
            'total'        => $paginated->total(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

  
    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

  
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'message'      => 'Notification marquée comme lue.',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message'      => 'Toutes les notifications sont marquées comme lues.',
            'unread_count' => 0,
        ]);
    }

    /**
     * Supprimer une notification.
     */
    public function destroy(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }

    
    private function format($notification): array
    {
        return [
            'id'         => $notification->id,
            'type'       => $notification->data['type'] ?? 'generic',
            'data'       => $notification->data,
            'read_at'    => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at->toIso8601String(),
        ];
    }
}