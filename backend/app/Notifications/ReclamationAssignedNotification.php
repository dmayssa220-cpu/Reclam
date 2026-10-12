<?php

namespace App\Notifications;

use App\Models\Reclamation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReclamationAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public Reclamation $reclamation)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Réclamation assignée : {$this->reclamation->reference}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Une réclamation vous a été assignée.")
            ->line("**Référence** : {$this->reclamation->reference}")
            ->line("**Titre** : {$this->reclamation->titre}")
            ->line("**Gravité** : {$this->reclamation->gravite}")
            ->line("**Adresse** : " . ($this->reclamation->adresse ?? 'Non spécifiée'))
            ->action('Voir la réclamation', url("/reclamations/{$this->reclamation->id}"))
            ->line("Merci de planifier une intervention.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'reclamation_assigned',
            'reclamation_id' => $this->reclamation->id,
            'reference'      => $this->reclamation->reference,
            'titre'          => $this->reclamation->titre,
            'gravite'        => $this->reclamation->gravite,
            'statut'         => $this->reclamation->statut,
            'message'        => "Réclamation {$this->reclamation->reference} vous a été assignée.",
            'url'            => "/reclamations/{$this->reclamation->id}",
        ];
    }
}