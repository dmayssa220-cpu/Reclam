<?php

namespace App\Notifications;

use App\Models\Reclamation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReclamationCreatedNotification extends Notification
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
            ->subject("Nouvelle réclamation : {$this->reclamation->reference}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Une nouvelle réclamation a été créée.")
            ->line("**Référence** : {$this->reclamation->reference}")
            ->line("**Titre** : {$this->reclamation->titre}")
            ->line("**Gravité** : {$this->reclamation->gravite}")
            ->line("**Zone** : " . ($this->reclamation->zone ?? 'Non spécifiée'))
            ->line("**Adresse** : " . ($this->reclamation->adresse ?? 'Non spécifiée'))
            ->action('Voir la réclamation', url("/reclamations/{$this->reclamation->id}"))
            ->line("Merci de traiter cette réclamation dans les meilleurs délais.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'            => 'reclamation_created',
            'reclamation_id'  => $this->reclamation->id,
            'reference'       => $this->reclamation->reference,
            'titre'           => $this->reclamation->titre,
            'gravite'         => $this->reclamation->gravite,
            'statut'          => $this->reclamation->statut,
            'zone'            => $this->reclamation->zone,
            'message'         => "Nouvelle réclamation {$this->reclamation->reference} : {$this->reclamation->titre}",
            'url'             => "/reclamations/{$this->reclamation->id}",
        ];
    }
}