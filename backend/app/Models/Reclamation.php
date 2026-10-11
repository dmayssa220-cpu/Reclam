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
        'assigned_at',
        'resolved_at',
        'closed_at',
    ];

    protected $casts = [
        'latitude'    => 'float',
        'longitude'   => 'float',
        'ia_score'    => 'float',
        'assigned_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at'   => 'datetime',
    ];

    // ==========================================
    // Relations
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function technicien()
    {
        return $this->belongsTo(User::class, 'technicien_id');
    }

    public function updates()
    {
        return $this->hasMany(ReclamationUpdate::class)->latest();
    }

    // ==========================================
    // Génération automatique de la référence
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
    // Scopes utiles
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
}