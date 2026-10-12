<?php

namespace App\Observers;

use App\Models\Reclamation;
use App\Models\User;
use App\Notifications\CriticalReclamationNotification;
use App\Notifications\ReclamationAssignedNotification;
use App\Notifications\ReclamationCreatedNotification;
use App\Notifications\ReclamationResolvedNotification;
use App\Notifications\ReclamationStatutChangedNotification;
use Illuminate\Support\Facades\Notification;

class ReclamationObserver
{
    /**
     * Après création : notifier superviseurs + admins.
     */
    public function created(Reclamation $reclamation): void
    {
        $destinataires = $this->superviseursEtAdmins($reclamation->zone);

        if ($destinataires->isNotEmpty()) {
            Notification::send($destinataires, new ReclamationCreatedNotification($reclamation));
        }

        // Alerte critique immédiate
        if ($reclamation->gravite === 'critique') {
            $admins = User::role('ADMIN')->get();
            if ($admins->isNotEmpty()) {
                Notification::send($admins, new CriticalReclamationNotification($reclamation));
            }
        }
    }

    /**
     * Après mise à jour : détecter les changements importants.
     */
    public function updated(Reclamation $reclamation): void
    {
        // Assignation à un technicien
        if ($reclamation->wasChanged('technicien_id') && $reclamation->technicien_id) {
            $technicien = $reclamation->technicien;
            if ($technicien) {
                $technicien->notify(new ReclamationAssignedNotification($reclamation));
            }
        }

        // Changement de statut
        if ($reclamation->wasChanged('statut')) {
            $ancienStatut  = $reclamation->getOriginal('statut');
            $nouveauStatut = $reclamation->statut;

            // Notifier le créateur
            $createur = $reclamation->user;
            if ($createur) {
                $createur->notify(new ReclamationStatutChangedNotification(
                    $reclamation,
                    $ancienStatut,
                    $nouveauStatut,
                ));
            }

            // Si résolu → notifier créateur + superviseurs
            if ($nouveauStatut === 'RESOLU' && $createur) {
                $createur->notify(new ReclamationResolvedNotification($reclamation));
            }

            // Si gravité passe à critique → alerte admins
            if ($reclamation->wasChanged('gravite') && $reclamation->gravite === 'critique') {
                $admins = User::role('ADMIN')->get();
                Notification::send($admins, new CriticalReclamationNotification($reclamation));
            }
        }
    }

    /**
     * Récupère les superviseurs + admins compétents pour une zone.
     */
    private function superviseursEtAdmins(?string $zone)
    {
        $query = User::role(['SUPERVISEUR', 'ADMIN']);

        if ($zone) {
            // Priorité : superviseurs de la zone
            $superviseursZone = User::role('SUPERVISEUR')
                ->where('zone', $zone)
                ->get();

            if ($superviseursZone->isNotEmpty()) {
                return $superviseursZone->merge(
                    User::role('ADMIN')->get()
                )->unique('id');
            }
        }

        return $query->get();
    }
}