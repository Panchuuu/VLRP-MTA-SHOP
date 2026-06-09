<?php

namespace Database\Seeders;

use App\Models\ComparisonFeature;
use Illuminate\Database\Seeder;

class ComparisonFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            'Dinero inicial',
            'Cajas de items',
            'Skin exclusiva',
            'Vehículo VIP',
            'Comando /heal',
            'Prioridad en cola',
            'Rol de Discord',
            'Acceso a eventos VIP',
        ];

        foreach ($features as $i => $label) {
            ComparisonFeature::firstOrCreate(
                ['label' => $label],
                ['sort_order' => $i + 1, 'is_active' => true]
            );
        }
    }
}
