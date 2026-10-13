<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Reclamation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'reference',
        'user_id',
        'superviseur_id',
        'technicien_id',
        'titre',
        'description',
        'adresse',
        'latitude',
        'longitude',
        'zone',
        'gravite',
        'statut',
        'ia_score',
        'ia_resume',
        'photo_url',
        'preuve_photo_url',
        'preuve_commentaire',
        'duree_intervention',
        'valide_par',
        'valide_at',
        'parent_id',
        'is_recurrence',
        'date_prevue',
        'assigned_at',
        'resolved_at',
        'closed_at',
    ];

    protected $casts = [
        'latitude'           => 'float',
        'longitude'          => 'float',
        'ia_score'           => 'float',
        'is_recurrence'      => 'boolean',
        'duree_intervention' => 'integer',
        'assigned_at'        => 'datetime',
        'date_prevue'        => 'datetime',
        'resolved_at'        => 'datetime',
        'valide_at'          => 'datetime',
        'closed_at'          => 'datetime',
    ];

    // ==========================================
    // Relations
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function superviseur()
    {
        return $this->belongsTo(User::class, 'superviseur_id');
    }

    public function technicien()
    {
        return $this->belongsTo(User::class, 'technicien_id');
    }

    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    public function parent()
    {
        return $this->belongsTo(Reclamation::class, 'parent_id');
    }

    public function recurrences()
    {
        return $this->hasMany(Reclamation::class, 'parent_id');
    }

    public function updates()
    {
        return $this->hasMany(ReclamationUpdate::class)->latest();
    }

    // ==========================================
    // Boot : génération référence
    // ==========================================

    protected static function booted(): void
    {
        static::creating(function (Reclamation $reclamation) {
            if (empty($reclamation->reference)) {
                $reclamation->reference = 'REC-' . strtoupper(Str::random(8));
            }
        });
    }

    // ==========================================
    // Scopes
    // ==========================================

    public function scopeActives($query)
    {
        return $query->whereNotIn('statut', ['CLOTURE', 'REJETE', 'DOUBLON']);
    }

    public function scopeCritiques($query)
    {
        return $query->where('gravite', 'critique')
                     ->whereNotIn('statut', ['CLOTURE', 'REJETE']);
    }

    public function scopeParZone($query, string $zone)
    {
        return $query->where('zone', $zone);
    }

    public function scopeSansSuperviseur($query)
    {
        return $query->whereNull('superviseur_id');
    }

    public function scopeSansTechnicien($query)
    {
        return $query->whereNull('technicien_id');
    }

    public function scopeAValider($query)
    {
        return $query->where('statut', 'A_VALIDER');
    }

    // ==========================================
    // Accesseurs utilitaires
    // ==========================================

    /**
     * Temps écoulé depuis la création (heures).
     */
    public function getAgeHeuresAttribute(): ?float
    {
        if (!$this->created_at) return null;
        return round($this->created_at->diffInMinutes(now()) / 60, 1);
    }

    /**
     * Temps de résolution (heures).
     */
    public function getDureeResolutionHeuresAttribute(): ?float
    {
        if (!$this->resolved_at) return null;
        return round($this->created_at->diffInMinutes($this->resolved_at) / 60, 1);
    }

    /**
     * Détermine l'étape actuelle du workflow.
     */
    public function getEtapeWorkflowAttribute(): string
    {
        if ($this->statut === 'NOUVEAU') return 'En attente d\'assignation superviseur';
        if ($this->statut === 'ASSIGNE' && !$this->technicien_id) return 'Assigné à un superviseur';
        if ($this->statut === 'ASSIGNE' && $this->technicien_id) return 'Assigné à un technicien';
        if ($this->statut === 'EN_COURS') return 'Intervention en cours';
        if ($this->statut === 'RESOLU') return 'Résolu, en attente de preuve';
        if ($this->statut === 'A_VALIDER') return 'En attente de validation superviseur';
        if ($this->statut === 'CLOTURE') return 'Clôturé';
        return ucfirst(strtolower($this->statut));
    }

    /**
     * Vérifie si le workflow est complet.
     */
    public function getEstCloturableAttribute(): bool
    {
        return $this->statut === 'A_VALIDER'
            && !empty($this->preuve_photo_url || $this->preuve_commentaire);
    }
}