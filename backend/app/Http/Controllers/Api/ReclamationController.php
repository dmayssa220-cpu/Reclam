<?php

namespace App\Http\Controllers\Api;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReclamationRequest;
use App\Http\Requests\UpdateReclamationRequest;
use App\Http\Requests\UpdateStatutRequest;
use App\Models\Reclamation;
use App\Models\ReclamationUpdate;
use Illuminate\Http\Request;


class ReclamationController extends Controller
{
   
    public function index(Request $request)
    {
        $this->authorize('viewAny', Reclamation::class);

        $user  = $request->user();
        $query = Reclamation::with(['user:id,name,email', 'technicien:id,name,email']);

       
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
            if ($request->statut === 'actives') {
                $query->whereNotIn('statut', ['RESOLU', 'CLOTURE', 'REJETE', 'DOUBLON']);
            } else {
                $query->where('statut', $request->statut);
            }
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
    /**
 * ADMIN assigne un SUPERVISEUR à la réclamation.
 */
public function assignSupervisor(Request $request, Reclamation $reclamation)
{
    $this->authorize('assignSupervisor', $reclamation);

    $data = $request->validate([
        'superviseur_id' => 'required|exists:users,id',
    ]);

    $superviseur = User::findOrFail($data['superviseur_id']);
    if (!$superviseur->hasRole('SUPERVISEUR')) {
        return response()->json([
            'message' => 'L\'utilisateur ciblé n\'est pas un superviseur.',
        ], 422);
    }

    $ancienStatut = $reclamation->statut;

    DB::transaction(function () use ($reclamation, $superviseur, $ancienStatut) {
        $reclamation->update([
            'superviseur_id' => $superviseur->id,
            'statut'         => 'ASSIGNE',
            'assigned_at'    => $reclamation->assigned_at ?? now(),
            'zone'           => $reclamation->zone ?? $superviseur->zone,
        ]);

        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => auth()->id(),
            'ancien_statut'  => $ancienStatut,
            'nouveau_statut' => 'ASSIGNE',
            'commentaire'    => "Assignée au superviseur {$superviseur->name}.",
        ]);
    });

    return response()->json(
        $reclamation->fresh()->load(['superviseur:id,name,email', 'user:id,name'])
    );
}
/**
 * SUPERVISEUR (ou ADMIN) assigne un TECHNICIEN.
 */
public function assignTechnician(Request $request, Reclamation $reclamation)
{
    $this->authorize('assignTechnician', $reclamation);

    $data = $request->validate([
        'technicien_id' => 'required|exists:users,id',
        'date_prevue'   => 'nullable|date|after:now',
    ]);

    $technicien = User::findOrFail($data['technicien_id']);
    if (!$technicien->hasRole('TECHNICIEN')) {
        return response()->json([
            'message' => 'L\'utilisateur ciblé n\'est pas un technicien.',
        ], 422);
    }

    $ancienStatut = $reclamation->statut;

    DB::transaction(function () use ($reclamation, $technicien, $data, $ancienStatut) {
        $reclamation->update([
            'technicien_id' => $technicien->id,
            'statut'        => 'ASSIGNE',
            'assigned_at'   => $reclamation->assigned_at ?? now(),
            'date_prevue'   => $data['date_prevue'] ?? null,
        ]);

        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => auth()->id(),
            'ancien_statut'  => $ancienStatut,
            'nouveau_statut' => 'ASSIGNE',
            'commentaire'    => "Assignée au technicien {$technicien->name}."
                . (isset($data['date_prevue']) ? " Intervention prévue le " . $data['date_prevue'] : ''),
        ]);
    });

    return response()->json(
        $reclamation->fresh()->load(['technicien:id,name,email', 'superviseur:id,name'])
    );
}
/**
 * TECHNICIEN démarre l'intervention (ASSIGNE → EN_COURS).
 */
public function demarrerIntervention(Request $request, Reclamation $reclamation)
{
    $user = $request->user();

    if ($reclamation->technicien_id !== $user->id) {
        return response()->json(['message' => 'Non autorisé.'], 403);
    }

    if (!in_array($reclamation->statut, ['ASSIGNE', 'EN_COURS'])) {
        return response()->json([
            'message' => 'Impossible de démarrer : statut actuel non compatible.',
        ], 422);
    }

    $ancienStatut = $reclamation->statut;

    $reclamation->update(['statut' => 'EN_COURS']);

    ReclamationUpdate::create([
        'reclamation_id' => $reclamation->id,
        'user_id'        => $user->id,
        'ancien_statut'  => $ancienStatut,
        'nouveau_statut' => 'EN_COURS',
        'commentaire'    => $request->input('commentaire', 'Intervention démarrée.'),
    ]);

    return response()->json($reclamation->fresh());
}
/**
 * TECHNICIEN résout avec preuve (photo + commentaire + durée).
 */
public function resolve(Request $request, Reclamation $reclamation)
{
    $this->authorize('resolve', $reclamation);

    $data = $request->validate([
        'preuve_commentaire'  => 'required|string|min:10|max:5000',
        'duree_intervention'  => 'required|integer|min:1|max:10000', // minutes
        'preuve_photo_url'    => 'nullable|url|max:500',
    ]);

    $ancienStatut = $reclamation->statut;

    DB::transaction(function () use ($reclamation, $data, $ancienStatut) {
        $reclamation->update([
            'preuve_commentaire' => $data['preuve_commentaire'],
            'duree_intervention' => $data['duree_intervention'],
            'preuve_photo_url'   => $data['preuve_photo_url'] ?? null,
            'statut'             => 'A_VALIDER',
            'resolved_at'        => now(),
        ]);

        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => auth()->id(),
            'ancien_statut'  => $ancienStatut,
            'nouveau_statut' => 'A_VALIDER',
            'commentaire'    => $data['preuve_commentaire'],
            'photo_url'      => $data['preuve_photo_url'] ?? null,
        ]);
    });

    return response()->json(
        $reclamation->fresh()->load(['technicien:id,name', 'superviseur:id,name'])
    );
}
/**
 * SUPERVISEUR valide la résolution (A_VALIDER → CLOTURE).
 */
public function validateReclamation(Request $request, Reclamation $reclamation)
{
    $this->authorize('validate', $reclamation);

    $data = $request->validate([
        'commentaire' => 'nullable|string|max:2000',
    ]);

    $ancienStatut = $reclamation->statut;

    DB::transaction(function () use ($reclamation, $data, $ancienStatut) {
        $reclamation->update([
            'statut'     => 'CLOTURE',
            'valide_par' => auth()->id(),
            'valide_at'  => now(),
            'closed_at'  => now(),
        ]);

        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => auth()->id(),
            'ancien_statut'  => $ancienStatut,
            'nouveau_statut' => 'CLOTURE',
            'commentaire'    => $data['commentaire'] ?? 'Résolution validée et clôturée.',
        ]);
    });

    return response()->json(
        $reclamation->fresh()->load(['validePar:id,name', 'technicien:id,name'])
    );
}
/**
 * SUPERVISEUR rejette la résolution (A_VALIDER → EN_COURS).
 */
public function reject(Request $request, Reclamation $reclamation)
{
    $this->authorize('reject', $reclamation);

    $data = $request->validate([
        'commentaire' => 'required|string|min:5|max:2000',
    ]);

    $ancienStatut = $reclamation->statut;

    $reclamation->update(['statut' => 'EN_COURS']);

    ReclamationUpdate::create([
        'reclamation_id' => $reclamation->id,
        'user_id'        => auth()->id(),
        'ancien_statut'  => $ancienStatut,
        'nouveau_statut' => 'EN_COURS',
        'commentaire'    => "Résolution rejetée : {$data['commentaire']}",
    ]);

    return response()->json($reclamation->fresh());
}

public function reopen(Request $request, Reclamation $reclamation)
{
    $this->authorize('reopen', $reclamation);

    $data = $request->validate([
        'commentaire' => 'required|string|min:5|max:2000',
        'gravite'     => 'nullable|in:faible,moyenne,critique',
    ]);

    $ancienStatut = $reclamation->statut;

    DB::transaction(function () use ($reclamation, $data, $ancienStatut) {
        $reclamation->update([
            'statut'     => 'EN_COURS',
            'gravite'    => $data['gravite'] ?? $reclamation->gravite,
            'resolved_at' => null,
            'closed_at'   => null,
        ]);

        ReclamationUpdate::create([
            'reclamation_id' => $reclamation->id,
            'user_id'        => auth()->id(),
            'ancien_statut'  => $ancienStatut,
            'nouveau_statut' => 'EN_COURS',
            'commentaire'    => "Réclamation rouverte : {$data['commentaire']}",
        ]);
    });

    return response()->json($reclamation->fresh());
}

public function addComment(Request $request, Reclamation $reclamation)
{
    $this->authorize('view', $reclamation);

    $data = $request->validate([
        'commentaire' => 'required|string|min:2|max:2000',
        'photo_url'   => 'nullable|url|max:500',
    ]);

    ReclamationUpdate::create([
        'reclamation_id' => $reclamation->id,
        'user_id'        => auth()->id(),
        'ancien_statut'  => $reclamation->statut,
        'nouveau_statut' => $reclamation->statut,
        'commentaire'    => $data['commentaire'],
        'photo_url'      => $data['photo_url'] ?? null,
    ]);

    return response()->json([
        'message' => 'Commentaire ajouté.',
        'updates' => $reclamation->fresh()->load('updates.user:id,name')->updates,
    ]);
}
/**
 * Liste des réclamations récurrentes (même adresse ou proximité).
 */
public function recurrences(Request $request)
{
    $user = $request->user();

    $query = Reclamation::with(['parent:id,reference,titre', 'superviseur:id,name', 'technicien:id,name'])
        ->where('is_recurrence', true);

    // Filtrage par rôle
    if ($user->hasRole('CITOYEN')) {
        $query->where('user_id', $user->id);
    } elseif ($user->hasRole('TECHNICIEN')) {
        $query->where('technicien_id', $user->id);
    } elseif ($user->hasRole('SUPERVISEUR')) {
        $query->where('zone', $user->zone);
    }

    if ($request->filled('zone')) {
        $query->where('zone', $request->zone);
    }

    return response()->json($query->latest()->paginate(20));
}

/**
 * Vue groupée : parents + enfants.
 */
public function recurrenceGroups(Request $request)
{
    // Groupes : parents ayant au moins 2 enfants
    $parents = Reclamation::withCount('recurrences')
        ->having('recurrences_count', '>=', 1)
        ->with(['recurrences' => fn($q) => $q->latest()->limit(10)])
        ->orderByDesc('recurrences_count')
        ->limit(50)
        ->get();

    return response()->json(['data' => $parents]);
}
}