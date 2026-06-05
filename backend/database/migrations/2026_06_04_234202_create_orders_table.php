<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->enum('status', [
                'pending', 'processing', 'completed', 'failed', 'refunded',
            ])->default('pending');
            $table->decimal('total', 10, 2);
            $table->string('payment_method', 50)->nullable();  // 'mercadopago'
            $table->string('payment_id', 200)->nullable();     // ID externo del proveedor
            $table->jsonb('payment_metadata')->nullable();     // Datos extra del pago
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
