<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('product_categories');
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('is_recurring')->default(false); // VIP mensual
            $table->integer('duration_days')->nullable();    // null = permanente
            $table->string('image_url', 500)->nullable();
            $table->string('discord_role_id', 20)->nullable();  // Rol a asignar en Discord
            $table->string('mta_command', 500)->nullable();     // Comando a ejecutar en MTA
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->integer('stock')->nullable();            // null = ilimitado
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
