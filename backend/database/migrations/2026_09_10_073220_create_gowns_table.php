<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gowns', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shop_id')
                ->constrained('shops')
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->constrained('categories')
                ->restrictOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            $table->string('size');
            $table->string('color');

            $table->decimal('rental_price', 10, 2);
            $table->decimal('selling_price', 10, 2)->nullable();

            $table->enum('condition', [
                'excellent',
                'good',
                'fair',
                'needs_repair',
            ])->default('good');

            $table->enum('status', [
                'available',
                'reserved',
                'rented',
                'maintenance',
                'unavailable',
            ])->default('available');

            $table->string('image')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gowns');
    }
};
