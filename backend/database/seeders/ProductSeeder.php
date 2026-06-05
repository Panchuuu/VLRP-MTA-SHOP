<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ── VIPs ──────────────────────────────────────────────────
            [
                'category_slug' => 'vip',
                'name' => 'VIP Bronce',
                'description' => 'Acceso a comandos exclusivos, tag [VIP] en el chat, y prioridad en la cola de entrada. Duración: 30 días.',
                'price' => 3990,
                'is_recurring' => true,
                'duration_days' => 30,
                'sort_order' => 1,
                'image_url' => 'https://placehold.co/400x300/1a1a2e/a78bfa?text=VIP+Bronce',
            ],
            [
                'category_slug' => 'vip',
                'name' => 'VIP Plata',
                'description' => 'Todo lo de Bronce + vehículo spawn exclusivo, acceso a zonas VIP y doble XP los fines de semana. Duración: 30 días.',
                'price' => 7990,
                'is_recurring' => true,
                'duration_days' => 30,
                'sort_order' => 2,
                'image_url' => 'https://placehold.co/400x300/1a1a2e/c0c0c0?text=VIP+Plata',
            ],
            [
                'category_slug' => 'vip',
                'name' => 'VIP Oro',
                'description' => 'Todo lo de Plata + casa inicial gratis, dinero de arranque extra y acceso al canal VIP en Discord. Duración: 30 días.',
                'price' => 14990,
                'is_recurring' => true,
                'duration_days' => 30,
                'sort_order' => 3,
                'image_url' => 'https://placehold.co/400x300/1a1a2e/fbbf24?text=VIP+Oro',
            ],
            [
                'category_slug' => 'vip',
                'name' => 'VIP Diamante',
                'description' => 'El rango más alto del servidor. Acceso a todo + nombre en color especial, vehículo único y acceso permanente sin necesidad de renovar.',
                'price' => 39990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 4,
                'image_url' => 'https://placehold.co/400x300/1a1a2e/67e8f9?text=VIP+Diamante',
            ],

            // ── Vehículos ─────────────────────────────────────────────
            [
                'category_slug' => 'vehiculos',
                'name' => 'Infernus Sport',
                'description' => 'El superdeportivo más rápido del servidor. Spawn en tu garaje al iniciar sesión.',
                'price' => 4990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 1,
                'image_url' => 'https://placehold.co/400x300/0f172a/f97316?text=Infernus',
            ],
            [
                'category_slug' => 'vehiculos',
                'name' => 'Sultan RS Tuneado',
                'description' => 'Sultan RS con tuning completo de fábrica. Ideal para carreras y roleplay mecánico.',
                'price' => 3490,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 2,
                'image_url' => 'https://placehold.co/400x300/0f172a/3b82f6?text=Sultan+RS',
            ],
            [
                'category_slug' => 'vehiculos',
                'name' => 'NRG-500 Premium',
                'description' => 'La moto más veloz del servidor con skin exclusivo.',
                'price' => 2990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 3,
                'image_url' => 'https://placehold.co/400x300/0f172a/22c55e?text=NRG-500',
            ],

            // ── Skins ─────────────────────────────────────────────────
            [
                'category_slug' => 'skins',
                'name' => 'Pack Policial LAPD',
                'description' => 'Uniforme de policía LAPD de alta calidad con accesorios. Disponible para roleplay civil y policial.',
                'price' => 1990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 1,
                'image_url' => 'https://placehold.co/400x300/0c1a2e/93c5fd?text=LAPD+Skin',
            ],
            [
                'category_slug' => 'skins',
                'name' => 'Pack Médico Emergencias',
                'description' => 'Uniforme de médico de emergencias con chaleco y accesorios. Para roleplay en hospitales.',
                'price' => 1990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 2,
                'image_url' => 'https://placehold.co/400x300/0c1a2e/f0abfc?text=Medico',
            ],

            // ── Propiedades ───────────────────────────────────────────
            [
                'category_slug' => 'propiedades',
                'name' => 'Casa Barrio Residencial',
                'description' => 'Casa propia en el barrio residencial de Valparaíso. Incluye garaje para 2 vehículos y sala interior.',
                'price' => 9990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 1,
                'image_url' => 'https://placehold.co/400x300/0f172a/86efac?text=Casa',
            ],
            [
                'category_slug' => 'propiedades',
                'name' => 'Local Comercial Centro',
                'description' => 'Local comercial en el centro de la ciudad. Perfecto para abrir negocios en el roleplay.',
                'price' => 14990,
                'is_recurring' => false,
                'duration_days' => null,
                'sort_order' => 2,
                'image_url' => 'https://placehold.co/400x300/0f172a/fde68a?text=Local',
            ],
        ];

        foreach ($products as $p) {
            $catId = ProductCategory::where('slug', $p['category_slug'])->value('id');
            unset($p['category_slug']);

            Product::updateOrCreate(
                ['slug' => Str::slug($p['name'])],
                array_merge($p, [
                    'slug' => Str::slug($p['name']),
                    'category_id' => $catId,
                    'is_active' => true,
                    'stock' => null,
                ])
            );
        }
    }
}
