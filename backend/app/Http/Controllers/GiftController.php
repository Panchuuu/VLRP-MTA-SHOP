<?php

namespace App\Http\Controllers;

use App\Services\DiscordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GiftController extends Controller
{
    /**
     * Resuelve un nombre de usuario de Discord a un miembro del guild.
     * Lo usa el checkout para confirmar el destinatario antes de pagar.
     */
    public function validateRecipient(Request $request, DiscordService $discord): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|min:2|max:100',
        ]);

        $member = $discord->findMemberByUsername($validated['username']);

        if (! $member) {
            return response()->json([
                'found' => false,
                'message' => 'No encontramos a ese usuario en el servidor de Discord. '
                    . 'Verifica que el nombre sea correcto y que esté en el Discord de Valparaíso RP.',
            ], 404);
        }

        // No tiene sentido regalarse a uno mismo.
        if ($member['discord_id'] === $request->user()->discord_id) {
            return response()->json([
                'found' => false,
                'message' => 'No puedes regalarte un producto a ti mismo.',
            ], 422);
        }

        return response()->json([
            'found' => true,
            'recipient' => $member,
        ]);
    }
}
