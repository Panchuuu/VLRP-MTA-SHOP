<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('discord_id', 20)->unique();
            $table->string('discord_username', 100);
            $table->string('discord_discriminator', 10)->nullable(); // legacy
            $table->string('discord_avatar', 500)->nullable();
            $table->text('discord_access_token')->nullable();
            $table->text('discord_refresh_token')->nullable();
            $table->timestamp('discord_token_expires_at')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->timestamps();
        });

        // Kept because SESSION_DRIVER=database. user_id is a UUID to match users.id.
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('sessions');
    }
};
