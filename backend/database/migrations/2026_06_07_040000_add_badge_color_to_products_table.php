<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('badge_color', 20)->nullable()->after('badge');
        });

        // Migrar los badges que eran claves de preset a texto legible + color,
        // para no perder los que ya estaban configurados.
        $presets = [
            'nuevo' => ['label' => 'Nuevo', 'color' => 'blue'],
            'popular' => ['label' => 'Popular', 'color' => 'purple'],
            'oferta' => ['label' => 'Oferta', 'color' => 'red'],
            'mas_vendido' => ['label' => 'Más vendido', 'color' => 'amber'],
        ];

        foreach ($presets as $key => $map) {
            DB::table('products')->where('badge', $key)->update([
                'badge' => $map['label'],
                'badge_color' => $map['color'],
            ]);
        }

        // Cualquier badge restante (texto ya libre) sin color → purple por defecto.
        DB::table('products')
            ->whereNotNull('badge')
            ->whereNull('badge_color')
            ->update(['badge_color' => 'purple']);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('badge_color');
        });
    }
};
