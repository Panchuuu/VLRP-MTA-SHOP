<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_feature_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('feature_id')->constrained('comparison_features')->cascadeOnDelete();
            $table->string('value', 100)->nullable(); // "✓", "✗", "$2.000.000", "10", etc.
            $table->timestamps();

            $table->unique(['product_id', 'feature_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_feature_values');
    }
};
