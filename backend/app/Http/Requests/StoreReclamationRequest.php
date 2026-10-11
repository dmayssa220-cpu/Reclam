<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReclamationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create-reclamation');
    }

    public function rules(): array
    {
        return [
            'titre'       => 'required|string|max:255',
            'description' => 'required|string|min:10|max:5000',
            'adresse'     => 'nullable|string|max:255',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'zone'        => 'nullable|string|max:100',
            'gravite'     => 'nullable|in:faible,moyenne,critique',
            'photo_url'   => 'nullable|url|max:500',
        ];
    }
}