<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload d'une photo (réclamation ou preuve d'intervention).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5 Mo
            'type' => 'nullable|in:reclamation,preuve,commentaire',
        ]);

        $type = $data['type'] ?? 'reclamation';
        $file = $request->file('file');

        // Nom de fichier unique
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Stockage dans storage/app/public/{type}s/
        $path = $file->storeAs("{$type}s", $filename, 'public');

        // URL publique
        $url = asset('storage/' . $path);

        return response()->json([
            'url'  => $url,
            'path' => $path,
        ], 201);
    }

    /**
     * Suppression d'une photo.
     */
    public function destroy(Request $request)
    {
        $data = $request->validate([
            'path' => 'required|string',
        ]);

        // Sécurité : empêche la suppression hors du dossier public
        if (Str::contains($data['path'], '..')) {
            return response()->json(['message' => 'Chemin invalide.'], 422);
        }

        $fullPath = 'public/' . $data['path'];
        if (\Storage::exists($fullPath)) {
            \Storage::delete($fullPath);
        }

        return response()->json(['message' => 'Photo supprimée.']);
    }
}