<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReclamationRequest;
use App\Http\Requests\UpdateReclamationRequest;
use App\Http\Requests\UpdateStatutRequest;
use App\Models\Reclamation;
use App\Models\ReclamationUpdate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReclamationController extends Controller
{
    /**
     * Liste paginée avec filtres.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Reclamation::class);

        $user  = $request->user();
        $query = Reclamation::with(['user:id,name,email', 'technicien:id,name,email']);

        // Filtrage selon le rôle
        if ($user->hasRole('CITOYEN')) {
            $query->where('user_id', $user->id);
        } elseif ($user->hasRole('TECHNICIEN')) {
            $query->where(function ($q) use ($user) {
                $q->where('technicien_id', $user->id)
                  ->orWhereNull('technicien_id');
            });
        }

        // Filtres optionnels
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('gravite')) {
            $query->where('gravite', $request->gravite);
        }
        if ($request->filled('zone')) {
            $query->where('zone', $request->zone);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('titre', 'like', "%$s%")
                  ->orWhere('reference', 'like', "%$s%")
                  ->orWhere('adresse', 'like', "%$s%");
            });
        }

        $reclamations = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json($reclamations);
    }

    /**
     * Création d'une réclamation.
     */
    public function store(StoreReclamationRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        // Si citoyen : gravité par défaut = moyenne
        if ($request->user()->hasRole('CITOYEN')) {
            $data['gravite'] = $data['gravite'] ?? 'moyenne';
        }

        $reclamation = Reclamation::create($data);

        // Journalisation
        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => $request->user()->id,
            'nouveau_statut' => 'NOUVEAU',
            'commentaire'    => 'Réclamation créée.',
        ]);

        return response()->json($reclamation->load('user:id,name,email'), 201);
    }

    /**
     * Détail d'une réclamation.
     */
    public function show(Reclamation $reclamation)
    {
        $this->authorize('view', $reclamation);

        return response()->json(
            $reclamation->load([
                'user:id,name,email',
                'technicien:id,name,email',
                'updates.user:id,name',
            ])
        );
    }

    /**
     * Mise à jour des champs modifiables (hors statut).
     */
    public function update(UpdateReclamationRequest $request, Reclamation $reclamation)
    {
        $this->authorize('update', $reclamation);

        $reclamation->update($request->validated());

        return response()->json($reclamation->fresh()->load('user:id,name,email'));
    }

    /**
     * Changement de statut + historique.
     */
    public function updateStatut(UpdateStatutRequest $request, Reclamation $reclamation)
    {
        $this->authorize('update', $reclamation);

        $ancien = $reclamation->statut;
        $nouveau = $request->statut;

        if ($ancien === $nouveau) {
            return response()->json(['message' => 'Statut inchangé.'], 200);
        }

        DB::transaction(function () use ($reclamation, $request, $ancien, $nouveau) {
            $reclamation->statut = $nouveau;

            if ($nouveau === 'ASSIGNE' && !$reclamation->assigned_at) {
                $reclamation->assigned_at = now();
            }
            if ($nouveau === 'RESOLU' && !$reclamation->resolved_at) {
                $reclamation->resolved_at = now();
            }
            if ($nouveau === 'CLOTURE' && !$reclamation->closed_at) {
                $reclamation->closed_at = now();
            }

            $reclamation->save();

            ReclamationUpdate::create([
                'reclamation_id' => $reclamation->id,
                'user_id'        => $request->user()->id,
                'ancien_statut'  => $ancien,
                'nouveau_statut' => $nouveau,
                'commentaire'    => $request->commentaire,
            ]);
        });

        return response()->json($reclamation->fresh()->load('updates.user:id,name'));
    }

    /**
     * Assignation à un technicien.
     */
    public function assign(Request $request, Reclamation $reclamation)
    {
        $this->authorize('assign', $reclamation);

        $data = $request->validate([
            'technicien_id' => 'required|exists:users,id',
        ]);

        $technicien = User::findOrFail($data['technicien_id']);
        if (!$technicien->hasRole('TECHNICIEN')) {
            return response()->json(['message' => 'L\'utilisateur ciblé n\'est pas un technicien.'], 422);
        }

        $ancien = $reclamation->statut;

        $reclamation->update([
            'technicien_id' => $technicien->id,
            'statut'        => 'ASSIGNE',
            'assigned_at'   => now(),
        ]);

        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => $request->user()->id,
            'ancien_statut'  => $ancien,
            'nouveau_statut' => 'ASSIGNE',
            'commentaire'    => "Assignée à {$technicien->name}.",
        ]);

        return response()->json($reclamation->fresh()->load('technicien:id,name,email'));
    }

    /**
     * Suppression (soft delete, ADMIN uniquement).
     */
    public function destroy(Reclamation $reclamation)
    {
        $this->authorize('delete', $reclamation);

        $reclamation->delete();

        return response()->json(['message' => 'Réclamation supprimée.']);
    }
}