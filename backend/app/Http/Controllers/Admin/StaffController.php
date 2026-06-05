<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaffMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => StaffMember::orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $member = StaffMember::create(array_merge($data, [
            'is_active' => $data['is_active'] ?? true,
        ]));

        return response()->json($member, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $member = StaffMember::findOrFail($id);
        $member->update($request->validate($this->rules(true)));

        return response()->json($member);
    }

    public function destroy(string $id): JsonResponse
    {
        StaffMember::findOrFail($id)->delete();

        return response()->json(['message' => 'Eliminado']);
    }

    private function rules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'name' => "$req|string|max:100",
            'role_title' => "$req|string|max:100",
            'description' => 'nullable|string',
            'discord_username' => 'nullable|string|max:100',
            'avatar_url' => 'nullable|url|max:500',
            'discord_id' => 'nullable|string|max:20',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
