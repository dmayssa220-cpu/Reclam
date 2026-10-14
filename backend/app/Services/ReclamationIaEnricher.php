<?php

namespace App\Services;

use App\Models\Reclamation;
use Illuminate\Support\Facades\Log;

class ReclamationIaEnricher
{
    public function __construct(private IaService $ia) {}


    public function enrichir(Reclamation $reclamation): void
    {

        $this->classifyGravite($reclamation);


        $this->detecterDoublon($reclamation);


        $this->genererResume($reclamation);

        $reclamation->saveQuietly();
    }

    private function classifyGravite(Reclamation $reclamation): void
    {
        $res = $this->ia->classify([
            'titre'       => $reclamation->titre,
            'description' => $reclamation->description,
            'adresse'     => $reclamation->adresse,
            'zone'        => $reclamation->zone,
            'latitude'    => $reclamation->latitude,
            'longitude'   => $reclamation->longitude,
        ]);

        if (!$res) return;

        $reclamation->ia_score = $res['score'] ?? null;


        if (
            empty($reclamation->gravite)
            || ($res['gravite'] === 'critique' && ($res['confiance'] ?? 0) >= 0.8)
        ) {
            $reclamation->gravite = $res['gravite'];
        }
    }

    private function detecterDoublon(Reclamation $reclamation): void
    {

        $candidates = Reclamation::query()
            ->where('id', '!=', $reclamation->id)
            ->when($reclamation->zone, fn($q) => $q->where('zone', $reclamation->zone))
            ->where('created_at', '>=', now()->subDays(90))
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn($r) => [
                'id'          => $r->id,
                'reference'   => $r->reference,
                'titre'       => $r->titre,
                'description' => $r->description,
                'latitude'    => $r->latitude,
                'longitude'   => $r->longitude,
                'adresse'     => $r->adresse,
                'created_at'  => $r->created_at->toIso8601String(),
            ])
            ->toArray();

        if (empty($candidates)) return;

        $res = $this->ia->detectDuplicates([
            'titre'       => $reclamation->titre,
            'description' => $reclamation->description,
            'adresse'     => $reclamation->adresse,
            'latitude'    => $reclamation->latitude,
            'longitude'   => $reclamation->longitude,
            'candidates'  => $candidates,
        ]);

        if (!$res || empty($res['is_duplicate']) || !$res['is_duplicate']) return;

        $best = $res['best_match_id'] ?? null;
        if ($best) {
            $reclamation->parent_id = $best;
            $reclamation->is_recurrence = true;
        }
    }

    private function genererResume(Reclamation $reclamation): void
    {
        $res = $this->ia->summarize([
            'reference'   => $reclamation->reference,
            'titre'       => $reclamation->titre,
            'description' => $reclamation->description,
            'adresse'     => $reclamation->adresse,
            'zone'        => $reclamation->zone,
            'gravite'     => $reclamation->gravite,
        ]);

        if ($res && !empty($res['resume'])) {
            $reclamation->ia_resume = $res['resume'];
        }
    }
}