<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use Illuminate\Http\Request;

class KpiController extends Controller
{
    /**
     * Liste des réclamations critiques en cours (widget).
     */
    public function critiquesEnCours(Request $request)
    {
        $user = $request->user();

        $query = Reclamation::with(['user:id,name', 'technicien:id,name'])
            ->where('gravite', 'critique')
            ->whereNotIn('statut', ['RESOLU', 'CLOTURE', 'REJETE', 'DOUBLON']);

        if ($user->hasRole('CITOYEN')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('TECHNICIEN')) {
            $query->where(function ($q) use ($user) {
                $q->where('technicien_id', $user->id)
                  ->orWhereNull('technicien_id');
            });
        }

        return response()->json([
            'data'  => $query->orderByDesc('created_at')->limit(10)->get(),
            'total' => $query->count(),
        ]);
    }

    /**
     * Export CSV des réclamations (filtres appliqués).
     */
    public function export(Request $request)
    {
        $user = $request->user();

        $query = Reclamation::with(['user:id,name', 'technicien:id,name']);

        if ($user->hasRole('CITOYEN')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('TECHNICIEN')) {
            $query->where('technicien_id', $user->id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('gravite')) {
            $query->where('gravite', $request->gravite);
        }
        if ($request->filled('zone')) {
            $query->where('zone', $request->zone);
        }
        if ($request->filled('debut')) {
            $query->where('created_at', '>=', $request->debut);
        }
        if ($request->filled('fin')) {
            $query->where('created_at', '<=', $request->fin);
        }

        $filename = 'reclamations_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');

            // BOM UTF-8 pour Excel
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'Référence', 'Titre', 'Description', 'Adresse', 'Zone',
                'Gravité', 'Statut', 'Créateur', 'Technicien',
                'Latitude', 'Longitude', 'Créée le', 'Résolue le',
            ], ';');

            $query->chunk(500, function ($reclamations) use ($file) {
                foreach ($reclamations as $r) {
                    fputcsv($file, [
                        $r->reference,
                        $r->titre,
                        $r->description,
                        $r->adresse,
                        $r->zone,
                        $r->gravite,
                        $r->statut,
                        $r->user?->name,
                        $r->technicien?->name,
                        $r->latitude,
                        $r->longitude,
                        $r->created_at?->format('d/m/Y H:i'),
                        $r->resolved_at?->format('d/m/Y H:i'),
                    ], ';');
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}