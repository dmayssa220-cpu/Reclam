<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReclamationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update-reclamation');
    }

    public function rules(): array
    {
        return [
            'titre'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string|min:10|max:5000',
            'adresse'     => 'nullable|string|max:255',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'zone'        => 'nullable|string|max:100',
            'gravite'     => 'sometimes|in:faible,moyenne,critique',
            'photo_url'   => 'nullable|url|max:500',
        ];
    }
}