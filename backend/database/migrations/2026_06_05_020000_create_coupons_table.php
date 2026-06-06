<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 100);
            $table->enum('type', ['percentage', 'fixed']);
            $table->decimal('value', 10, 2);            // % o CLP
            $table->decimal('min_purchase', 10, 2)->default(0);
            $table->integer('max_uses')->nullable();     // null = ilimitado
            $table->integer('uses_count')->default(0);
            $table->timestamp('expires_at')->nullable(); // null = sin vencimiento
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
