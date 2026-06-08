<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Bronce, Plata, Oro, Diamante, Valparaiso, Max, Boost, Streamer
            // Solo los productos VIP tendrán este campo. null = no genera código.
            $table->string('game_category', 50)->nullable()->after('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('game_category');
        });
    }
};
