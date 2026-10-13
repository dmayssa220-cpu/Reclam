<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Liste des superviseurs (pour l'assignation ADMIN → SUPERVISEUR).
     */
    public function superviseurs(Request $request)
    {
        $query = User::role('SUPERVISEUR')->where('is_active', true);

        if ($request->filled('zone')) {
            $query->where('zone', $request->zone);
        }

        return response()->json(
            $query->select('id', 'name', 'email', 'zone')->orderBy('name')->get()
        );
    }

    /**
     * Liste des techniciens (pour l'assignation SUPERVISEUR → TECHNICIEN).
     */
    public function techniciens(Request $request)
    {
        $query = User::role('TECHNICIEN')->where('is_active', true);

        if ($request->filled('zone')) {
            $query->where('zone', $request->zone);
        }

        return response()->json(
            $query->select('id', 'name', 'email', 'zone')->orderBy('name')->get()
        );
    }

    /**
     * Statistiques charge de travail (pour aider le superviseur à choisir).
     */
    public function chargeTechniciens()
    {
        $techniciens = User::role('TECHNICIEN')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'zone')
            ->get()
            ->map(function ($tech) {
                $enCours = \App\Models\Reclamation::where('technicien_id', $tech->id)
                    ->whereIn('statut', ['ASSIGNE', 'EN_COURS'])
                    ->count();

                return array_merge($tech->toArray(), ['en_cours' => $enCours]);
            });

        return response()->json($techniciens);
    }
}