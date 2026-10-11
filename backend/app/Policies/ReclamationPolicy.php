<?php

namespace App\Policies;

use App\Models\Reclamation;
use App\Models\User;

class ReclamationPolicy
{
   
    public function viewAny(User $user): bool
    {
        return $user->can('view-reclamations') || $user->can('view-own-reclamations');
    }

    public function view(User $user, Reclamation $reclamation): bool
    {
        if ($user->hasRole(['ADMIN', 'SUPERVISEUR', 'ANALYSTE'])) {
            return true;
        }

        if ($user->hasRole('TECHNICIEN')) {
            return $reclamation->technicien_id === $user->id
                || is_null($reclamation->technicien_id);
        }

        return $reclamation->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('create-reclamation');
    }

    public function update(User $user, Reclamation $reclamation): bool
    {
        // ADMIN / SUPERVISEUR : tout
        if ($user->hasRole(['ADMIN', 'SUPERVISEUR'])) {
            return true;
        }

        // TECHNICIEN : seulement ses réclamations assignées
        if ($user->hasRole('TECHNICIEN')) {
            return $reclamation->technicien_id === $user->id;
        }

        // CITOYEN : peut éditer uniquement si encore NOUVEAU
        return $reclamation->user_id === $user->id
            && $reclamation->statut === 'NOUVEAU';
    }

    public function assign(User $user, Reclamation $reclamation): bool
    {
        return $user->hasRole(['ADMIN', 'SUPERVISEUR'])
            && $user->can('assign-reclamation');
    }

    public function close(User $user, Reclamation $reclamation): bool
    {
        return $user->hasRole(['ADMIN', 'SUPERVISEUR'])
            && $user->can('close-reclamation');
    }

    public function delete(User $user, Reclamation $reclamation): bool
    {
        return $user->hasRole('ADMIN');
    }
}