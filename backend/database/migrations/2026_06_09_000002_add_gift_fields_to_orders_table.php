<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('is_gift')->default(false)->after('payment_metadata');
            $table->string('gift_recipient_discord_id', 32)->nullable()->after('is_gift');
            $table->string('gift_recipient_username', 100)->nullable()->after('gift_recipient_discord_id');
            $table->string('gift_message', 280)->nullable()->after('gift_recipient_username');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'is_gift',
                'gift_recipient_discord_id',
                'gift_recipient_username',
                'gift_message',
            ]);
        });
    }
};
