<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles:id,name')
            ->select('id', 'name', 'email', 'zone', 'telephone', 'is_active', 'created_at');

        if ($request->filled('role')) {
            $query->role($request->role);
        }
        if ($request->filled('zone')) {
            $query->where('zone', $request->zone);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%"));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'zone'     => 'nullable|string|max:100',
            'telephone'=> 'nullable|string|max:20',
            'role'     => ['required', Rule::in(['ADMIN', 'SUPERVISEUR', 'TECHNICIEN', 'CITOYEN', 'ANALYSTE'])],
        ]);

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'zone'      => $data['zone'] ?? null,
            'telephone' => $data['telephone'] ?? null,
            'is_active' => true,
        ]);

        $user->assignRole($data['role']);

        return response()->json($user->load('roles:id,name'), 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'zone'     => 'nullable|string|max:100',
            'telephone'=> 'nullable|string|max:20',
            'is_active'=> 'sometimes|boolean',
            'role'     => ['sometimes', Rule::in(['ADMIN', 'SUPERVISEUR', 'TECHNICIEN', 'CITOYEN', 'ANALYSTE'])],
        ]);

        $user->update($data);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return response()->json($user->fresh()->load('roles:id,name'));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Impossible de se supprimer soi-même.'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);
        return response()->json($user->load('roles:id,name'));
    }
}