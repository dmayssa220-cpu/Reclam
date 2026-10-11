<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReclamationUpdate extends Model
{
    protected $fillable = [
        'reclamation_id',
        'user_id',
        'ancien_statut',
        'nouveau_statut',
        'commentaire',
        'photo_url',
    ];

    public function reclamation()
    {
        return $this->belongsTo(Reclamation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}