<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Endpoint principal : renvoie tous les KPIs en un seul appel.
     */
    public function kpi(Request $request)
    {
        $user = $request->user();

        // Période (défaut : 30 derniers jours)
        $periode = (int) $request->input('periode', 30); // en jours
        $dateDebut = Carbon::now()->subDays($periode)->startOfDay();
        $dateFin   = Carbon::now()->endOfDay();

       
        $base = $this->baseQuery($user, $dateDebut, $dateFin);

        return response()->json([
            'periode'       => [
                'jours'  => $periode,
                'debut'  => $dateDebut->toDateString(),
                'fin'    => $dateFin->toDateString(),
            ],
            'scalaires'     => $this->scalaires($base),
            'evolution'     => $this->evolution($user, $dateDebut, $dateFin),
            'par_gravite'   => $this->parGravite($base),
            'par_statut'    => $this->parStatut($base),
            'top_zones'     => $this->topZones($base),
            'recurrence'    => $this->recurrence($base),
        ]);
    }

    /**
     * Query de base filtrée par rôle.
     */
    private function baseQuery($user, Carbon $debut, Carbon $fin)
    {
        $q = Reclamation::query()
            ->whereBetween('created_at', [$debut, $fin]);

        if ($user->hasRole('CITOYEN')) {
            $q->where('user_id', $user->id);
        } elseif ($user->hasRole('TECHNICIEN')) {
            $q->where(function ($sq) use ($user) {
                $sq->where('technicien_id', $user->id)
                   ->orWhereNull('technicien_id');
            });
        }
        

        return $q;
    }

    /**
     * KPIs scalaires.
     */
    private function scalaires($base): array
    {
        $total = (clone $base)->count();

        $resolues = (clone $base)
            ->whereIn('statut', ['RESOLU', 'CLOTURE'])
            ->count();

        $tauxResolution = $total > 0 ? round(($resolues / $total) * 100, 1) : 0;

       
        $avgSeconds = (clone $base)
            ->whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, created_at, resolved_at)) as avg_seconds')
            ->value('avg_seconds');

        $tempsMoyenHeures = $avgSeconds ? round($avgSeconds / 3600, 1) : 0;

        // SLA : résolues en moins de 48h
        $slaRespecte = (clone $base)
            ->whereNotNull('resolved_at')
            ->whereRaw('TIMESTAMPDIFF(HOUR, created_at, resolved_at) <= 48')
            ->count();

        $slaTotal = (clone $base)
            ->whereNotNull('resolved_at')
            ->count();

        $tauxSla = $slaTotal > 0 ? round(($slaRespecte / $slaTotal) * 100, 1) : 0;

        // Critiques actives (non résolues, toutes périodes confondues)
        $critiquesActives = Reclamation::where('gravite', 'critique')
            ->whereNotIn('statut', ['RESOLU', 'CLOTURE', 'REJETE'])
            ->count();

        
        $enCours = (clone $base)
            ->whereIn('statut', ['ASSIGNE', 'EN_COURS'])
            ->count();

        return [
            'total'             => $total,
            'resolues'          => $resolues,
            'en_cours'          => $enCours,
            'taux_resolution'   => $tauxResolution,
            'temps_moyen_heures' => $tempsMoyenHeures,
            'taux_sla'          => $tauxSla,
            'critiques_actives' => $critiquesActives,
        ];
    }

    /**
     * Évolution temporelle (créées + résolues par jour).
     */
    private function evolution($user, Carbon $debut, Carbon $fin): array
    {
        
        $creees = $this->baseQuery($user, $debut, $fin)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date')
            ->toArray();

        
        $resolues = Reclamation::query()
            ->whereBetween('resolved_at', [$debut, $fin])
            ->whereNotNull('resolved_at')
            ->when($user->hasRole('CITOYEN'), fn($q) => $q->where('user_id', $user->id))
            ->when($user->hasRole('TECHNICIEN'), fn($q) => $q->where('technicien_id', $user->id))
            ->selectRaw('DATE(resolved_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('total', 'date')
            ->toArray();

       
        $days = [];
        $cursor = $debut->copy();
        while ($cursor->lte($fin)) {
            $key = $cursor->toDateString();
            $days[] = [
                'date'     => $key,
                'label'    => $cursor->format('d/m'),
                'creees'   => $creees[$key] ?? 0,
                'resolues' => $resolues[$key] ?? 0,
            ];
            $cursor->addDay();
        }

        return $days;
    }

   
    private function parGravite($base): array
    {
        $data = (clone $base)
            ->selectRaw('gravite, COUNT(*) as total')
            ->groupBy('gravite')
            ->pluck('total', 'gravite')
            ->toArray();

        return [
            ['name' => 'Faible',   'value' => (int) ($data['faible'] ?? 0),   'key' => 'faible',   'color' => '#10b981'],
            ['name' => 'Moyenne',  'value' => (int) ($data['moyenne'] ?? 0),  'key' => 'moyenne',  'color' => '#f59e0b'],
            ['name' => 'Critique', 'value' => (int) ($data['critique'] ?? 0), 'key' => 'critique', 'color' => '#ef4444'],
        ];
    }

      private function parStatut($base): array
    {
        $data = (clone $base)
            ->selectRaw('statut, COUNT(*) as total')
            ->groupBy('statut')
            ->pluck('total', 'statut')
            ->toArray();

        $statuts = [
            'NOUVEAU'  => ['label' => 'Nouveau',  'color' => '#0ea5e9'],
            'QUALIFIE' => ['label' => 'Qualifié', 'color' => '#06b6d4'],
            'ASSIGNE'  => ['label' => 'Assigné',  'color' => '#f59e0b'],
            'EN_COURS' => ['label' => 'En cours', 'color' => '#eab308'],
            'RESOLU'   => ['label' => 'Résolu',   'color' => '#10b981'],
            'CLOTURE'  => ['label' => 'Clôturé',  'color' => '#64748b'],
            'REJETE'   => ['label' => 'Rejeté',   'color' => '#ef4444'],
            'DOUBLON'  => ['label' => 'Doublon',  'color' => '#a855f7'],
        ];

        $result = [];
        foreach ($statuts as $key => $cfg) {
            $result[] = [
                'key'   => $key,
                'name'  => $cfg['label'],
                'value' => (int) ($data[$key] ?? 0),
                'color' => $cfg['color'],
            ];
        }

        return $result;
    }
    private function topZones($base): array
    {
        return (clone $base)
            ->whereNotNull('zone')
            ->where('zone', '!=', '')
            ->selectRaw('zone as name, COUNT(*) as value')
            ->groupBy('zone')
            ->orderByDesc('value')
            ->limit(5)
            ->get()
            ->map(fn($row) => [
                'name'  => $row->name,
                'value' => (int) $row->value,
            ])
            ->toArray();
    }

   
    private function recurrence($base): array
    {
        $total = (clone $base)->whereNotNull('adresse')->where('adresse', '!=', '')->count();

        $recurrentes = DB::table('reclamations')
            ->whereBetween('created_at', [now()->subDays(90), now()])
            ->whereNotNull('adresse')
            ->where('adresse', '!=', '')
            ->select('adresse')
            ->groupBy('adresse')
            ->havingRaw('COUNT(*) >= 2')
            ->get()
            ->count();

        $taux = $total > 0 ? round(($recurrentes / $total) * 100, 1) : 0;

        return [
            'total_adresses'  => $total,
            'recurrentes'     => $recurrentes,
            'taux'            => $taux,
        ];
    }
}