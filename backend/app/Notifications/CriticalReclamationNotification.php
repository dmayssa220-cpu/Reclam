<?php

namespace App\Notifications;

use App\Models\Reclamation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalReclamationNotification extends Notification
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
            ->subject("🚨 ALERTE — Fuite critique : {$this->reclamation->reference}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("⚠️ Une fuite **critique** nécessite votre attention immédiate.")
            ->line("**Référence** : {$this->reclamation->reference}")
            ->line("**Titre** : {$this->reclamation->titre}")
            ->line("**Adresse** : " . ($this->reclamation->adresse ?? 'Non spécifiée'))
            ->line("**Zone** : " . ($this->reclamation->zone ?? 'Non spécifiée'))
            ->action('Voir et traiter', url("/reclamations/{$this->reclamation->id}"))
            ->line("Merci de prioriser cette intervention.");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'critical_reclamation',
            'reclamation_id' => $this->reclamation->id,
            'reference'      => $this->reclamation->reference,
            'titre'          => $this->reclamation->titre,
            'gravite'        => 'critique',
            'message'        => "🚨 Fuite CRITIQUE {$this->reclamation->reference} : {$this->reclamation->titre}",
            'url'            => "/reclamations/{$this->reclamation->id}",
        ];
    }
}