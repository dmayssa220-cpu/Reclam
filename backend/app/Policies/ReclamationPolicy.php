<?php

namespace App\Policies;

use App\Models\Reclamation;
use App\Models\User;

class ReclamationPolicy
{
    /**
     * Liste : qui peut voir la liste.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view-reclamations')
            || $user->can('view-own-reclamations');
    }

    /**
     * Détail : règles de visibilité.
     */
    public function view(User $user, Reclamation $reclamation): bool
    {
        if ($user->hasRole(['ADMIN', 'ANALYSTE'])) return true;

        if ($user->hasRole('SUPERVISEUR')) {
            // Voir les réclamations de sa zone OU dont il est le superviseur
            return $reclamation->superviseur_id === $user->id
                || $reclamation->zone === $user->zone
                || is_null($reclamation->superviseur_id);
        }

        if ($user->hasRole('TECHNICIEN')) {
            return $reclamation->technicien_id === $user->id
                || is_null($reclamation->technicien_id);
        }

        // Citoyen : ses propres réclamations
        return $reclamation->user_id === $user->id;
    }

    /**
     * Création.
     */
    public function create(User $user): bool
    {
        return $user->can('create-reclamation');
    }

    /**
     * Mise à jour générale (titre, description, gravité).
     */
    public function update(User $user, Reclamation $reclamation): bool
    {
        if ($user->hasRole(['ADMIN', 'SUPERVISEUR'])) return true;

        if ($user->hasRole('TECHNICIEN')) {
            return $reclamation->technicien_id === $user->id;
        }

        // Citoyen : seulement si NOUVEAU
        return $reclamation->user_id === $user->id
            && $reclamation->statut === 'NOUVEAU';
    }

    /**
     * ADMIN assigne à un SUPERVISEUR.
     */
    public function assignSupervisor(User $user, Reclamation $reclamation): bool
    {
        return $user->hasRole('ADMIN')
            && $user->can('assign-supervisor');
    }

    /**
     * SUPERVISEUR assigne à un TECHNICIEN.
     * Peut être fait par ADMIN également.
     */
    public function assignTechnician(User $user, Reclamation $reclamation): bool
    {
        if (!$user->can('assign-technician')) return false;

        if ($user->hasRole('ADMIN')) return true;

        if ($user->hasRole('SUPERVISEUR')) {
            return $reclamation->superviseur_id === $user->id
                || is_null($reclamation->superviseur_id);
        }

        return false;
    }

    /**
     * TECHNICIEN marque comme résolu (avec preuve).
     */
    public function resolve(User $user, Reclamation $reclamation): bool
    {
        if (!$user->can('resolve-reclamation')) return false;

        return $reclamation->technicien_id === $user->id
            && in_array($reclamation->statut, ['ASSIGNE', 'EN_COURS']);
    }

    /**
     * SUPERVISEUR valide la résolution (CLOTURE).
     */
    public function validate(User $user, Reclamation $reclamation): bool
    {
        if (!$user->can('validate-reclamation')) return false;

        if ($user->hasRole('ADMIN')) return true;

        return $user->hasRole('SUPERVISEUR')
            && ($reclamation->superviseur_id === $user->id
                || $reclamation->zone === $user->zone)
            && $reclamation->statut === 'A_VALIDER';
    }

    /**
     * SUPERVISEUR rejette la résolution.
     */
    public function reject(User $user, Reclamation $reclamation): bool
    {
        if (!$user->can('reject-reclamation')) return false;

        if ($user->hasRole('ADMIN')) return true;

        return $user->hasRole('SUPERVISEUR')
            && ($reclamation->superviseur_id === $user->id
                || $reclamation->zone === $user->zone)
            && $reclamation->statut === 'A_VALIDER';
    }

    /**
     * SUPERVISEUR rouvre une réclamation clôturée.
     */
    public function reopen(User $user, Reclamation $reclamation): bool
    {
        if (!$user->can('reopen-reclamation')) return false;

        if ($user->hasRole('ADMIN')) return true;

        return $user->hasRole('SUPERVISEUR')
            && ($reclamation->superviseur_id === $user->id
                || $reclamation->zone === $user->zone)
            && in_array($reclamation->statut, ['RESOLU', 'CLOTURE', 'A_VALIDER']);
    }

    /**
     * Fermeture directe (ADMIN).
     */
    public function close(User $user, Reclamation $reclamation): bool
    {
        return $user->hasRole('ADMIN')
            && $user->can('close-reclamation');
    }

    /**
     * Suppression (ADMIN uniquement).
     */
    public function delete(User $user, Reclamation $reclamation): bool
    {
        return $user->hasRole('ADMIN');
    }
}