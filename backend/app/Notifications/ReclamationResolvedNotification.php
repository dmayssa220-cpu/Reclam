<?php

namespace App\Notifications;

use App\Models\Reclamation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReclamationResolvedNotification extends Notification
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
            ->subject("✅ Réclamation résolue : {$this->reclamation->reference}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Votre réclamation a été résolue.")
            ->line("**Référence** : {$this->reclamation->reference}")
            ->line("**Titre** : {$this->reclamation->titre}")
            ->line("**Résolue le** : " . $this->reclamation->resolved_at?->format('d/m/Y à H:i'))
            ->action('Voir le détail', url("/reclamations/{$this->reclamation->id}"))
            ->line("Merci de votre contribution !");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'reclamation_resolved',
            'reclamation_id' => $this->reclamation->id,
            'reference'      => $this->reclamation->reference,
            'titre'          => $this->reclamation->titre,
            'message'        => "La réclamation {$this->reclamation->reference} a été résolue.",
            'url'            => "/reclamations/{$this->reclamation->id}",
        ];
    }
}