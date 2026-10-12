<?php

namespace App\Notifications;

use App\Models\Reclamation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReclamationStatutChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Reclamation $reclamation,
        public string $ancienStatut,
        public string $nouveauStatut,
        public ?string $commentaire = null,
    ) {
    }

    public function via(object $notifiable): array
    {
        // Uniquement in-app pour ne pas spammer
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'reclamation_statut_changed',
            'reclamation_id' => $this->reclamation->id,
            'reference'      => $this->reclamation->reference,
            'titre'          => $this->reclamation->titre,
            'ancien_statut'  => $this->ancienStatut,
            'nouveau_statut' => $this->nouveauStatut,
            'commentaire'    => $this->commentaire,
            'message'        => "Statut de {$this->reclamation->reference} : {$this->ancienStatut} → {$this->nouveauStatut}",
            'url'            => "/reclamations/{$this->reclamation->id}",
        ];
    }
}