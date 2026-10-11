<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update-reclamation');
    }

    public function rules(): array
    {
        return [
            'statut'      => 'required|in:NOUVEAU,QUALIFIE,ASSIGNE,EN_COURS,RESOLU,CLOTURE,REJETE,DOUBLON',
            'commentaire' => 'nullable|string|max:2000',
        ];
    }
}