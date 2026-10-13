<?php

namespace App\Services;

use App\Models\Reclamation;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class RecurrenceDetector
{
    /**
     * Détecte les réclamations similaires (même adresse OU même zone+proximité).
     *
     * @return Collection<int, Reclamation>
     */
    public function detecter(Reclamation $nouvelle, float $rayonKm = 0.2, int $joursFenetre = 90): Collection
    {
        $query = Reclamation::query()
            ->where('id', '!=', $nouvelle->id)
            ->where('created_at', '>=', now()->subDays($joursFenetre));

        // 1) Match par adresse exacte (le plus fiable)
        if ($nouvelle->adresse) {
            $adresseNormalisee = Str::lower(trim($nouvelle->adresse));

            $parAdresse = (clone $query)
                ->whereRaw('LOWER(TRIM(adresse)) = ?', [$adresseNormalisee])
                ->get();

            if ($parAdresse->isNotEmpty()) {
                return $parAdresse;
            }
        }

        // 2) Match par proximité GPS
        if ($nouvelle->latitude && $nouvelle->longitude) {
            $latDelta = $rayonKm / 111.0;
            $lngDelta = $rayonKm / (111.0 * cos(deg2rad($nouvelle->latitude)));

            return (clone $query)
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->whereBetween('latitude', [
                    $nouvelle->latitude - $latDelta,
                    $nouvelle->latitude + $latDelta,
                ])
                ->whereBetween('longitude', [
                    $nouvelle->longitude - $lngDelta,
                    $nouvelle->longitude + $lngDelta,
                ])
                ->get();
        }

        return collect();
    }

    /**
     * Marque une nouvelle réclamation comme récurrence d'une existante.
     */
    public function marquerRecurrence(Reclamation $nouvelle, Reclamation $parent): void
    {
        $nouvelle->update([
            'parent_id'     => $parent->id,
            'is_recurrence' => true,
            'gravite'       => $parent->gravite === 'critique' ? 'critique' : 'moyenne',
        ]);
    }
}