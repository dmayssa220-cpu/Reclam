<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use App\Services\IaService;
use Illuminate\Http\Request;

class IaController extends Controller
{
    public function __construct(private IaService $ia) {}


    public function health()
    {
        $health = $this->ia->health();

        return response()->json([
            'available' => $health !== null,
            'details'   => $health,
        ]);
    }


    public function analyze(Request $request, Reclamation $reclamation)
    {
        $this->authorize('update', $reclamation);

        $classification = $this->ia->classify([
            'titre'       => $reclamation->titre,
            'description' => $reclamation->description,
            'adresse'     => $reclamation->adresse,
            'zone'        => $reclamation->zone,
            'latitude'    => $reclamation->latitude,
            'longitude'   => $reclamation->longitude,
        ]);

        $resume = $this->ia->summarize([
            'reference'   => $reclamation->reference,
            'titre'       => $reclamation->titre,
            'description' => $reclamation->description,
            'adresse'     => $reclamation->adresse,
            'zone'        => $reclamation->zone,
            'gravite'     => $reclamation->gravite,
        ]);

        if ($classification) {
            $reclamation->ia_score = $classification['score'];
        }
        if ($resume && !empty($resume['resume'])) {
            $reclamation->ia_resume = $resume['resume'];
        }
        $reclamation->saveQuietly();

        return response()->json([
            'classification' => $classification,
            'resume'         => $resume,
            'reclamation'    => $reclamation->fresh(),
        ]);
    }


    public function predictRecurrence(Request $request, Reclamation $reclamation)
    {
        $history = Reclamation::query()
            ->where('id', '!=', $reclamation->id)
            ->where(function ($q) use ($reclamation) {
                if ($reclamation->adresse) {
                    $q->where('adresse', $reclamation->adresse);
                }
                if ($reclamation->latitude && $reclamation->longitude) {
                    $q->orWhere(function ($sq) use ($reclamation) {
                        $sq->whereBetween('latitude', [
                            $reclamation->latitude - 0.005,
                            $reclamation->latitude + 0.005,
                        ])->whereBetween('longitude', [
                            $reclamation->longitude - 0.005,
                            $reclamation->longitude + 0.005,
                        ]);
                    });
                }
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn($r) => [
                'adresse'    => $r->adresse,
                'latitude'   => $r->latitude,
                'longitude'  => $r->longitude,
                'created_at' => $r->created_at->toIso8601String(),
                'gravite'    => $r->gravite,
            ])
            ->toArray();

        $result = $this->ia->predictRecurrence([
            'adresse'   => $reclamation->adresse,
            'latitude'  => $reclamation->latitude,
            'longitude' => $reclamation->longitude,
            'history'   => $history,
        ]);

        return response()->json($result ?? ['probabilite' => 0, 'niveau_risque' => 'faible']);
    }
}