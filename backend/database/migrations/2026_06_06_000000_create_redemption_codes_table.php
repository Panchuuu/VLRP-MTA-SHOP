<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('redemption_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 32)->unique();
            $table->string('category', 50);                 // Bronce, Plata, Oro, etc.
            $table->foreignUuid('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('source', ['purchase', 'manual'])->default('purchase');
            $table->enum('status', ['pending', 'redeemed'])->default('pending');
            $table->string('redeemed_serial', 50)->nullable();      // serial MTA del jugador que canjeó
            $table->string('redeemed_player_name', 100)->nullable();
            $table->timestamp('redeemed_at')->nullable();
            $table->string('created_by', 100)->nullable();          // admin que lo creó (manual)
            $table->timestamps();

            $table->index('status');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('redemption_codes');
    }
};
