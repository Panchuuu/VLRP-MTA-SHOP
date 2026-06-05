<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'VIP',         'slug' => 'vip',         'icon' => 'crown',    'sort_order' => 1, 'description' => 'Rangos VIP con beneficios exclusivos en el servidor'],
            ['name' => 'Vehículos',   'slug' => 'vehiculos',   'icon' => 'car',      'sort_order' => 2, 'description' => 'Autos, motos y vehículos especiales'],
            ['name' => 'Skins',       'slug' => 'skins',       'icon' => 'shirt',    'sort_order' => 3, 'description' => 'Apariencias y uniformes exclusivos'],
            ['name' => 'Propiedades', 'slug' => 'propiedades', 'icon' => 'building', 'sort_order' => 4, 'description' => 'Casas, locales y propiedades en el mapa'],
        ];

        foreach ($categories as $cat) {
            ProductCategory::updateOrCreate(['slug' => $cat['slug']], array_merge($cat, [
                'is_active' => true,
            ]));
        }
    }
}
