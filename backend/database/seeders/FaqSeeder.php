<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            // ── Códigos ───────────────────────────────────────────────
            [
                'category' => 'Codigos',
                'question' => '¿Cómo canjeo mi código VIP?',
                'answer' => 'Entra al servidor y escribe /canjearvip seguido de tu código en el chat. Por ejemplo: /canjearvip ABCD-1234. El beneficio se activará al instante en tu cuenta.',
                'sort_order' => 1,
            ],
            [
                'category' => 'Codigos',
                'question' => '¿Dónde encuentro mi código tras la compra?',
                'answer' => 'Tu código aparece en la página de confirmación de la orden y también en "Mis Órdenes" dentro de tu cuenta. Cada código es de un solo uso.',
                'sort_order' => 2,
            ],

            // ── Pagos ─────────────────────────────────────────────────
            [
                'category' => 'Pagos',
                'question' => '¿Qué métodos de pago aceptan?',
                'answer' => 'Aceptamos pagos a través de Flow (Webpay, tarjetas de crédito y débito). El cobro se realiza en pesos chilenos (CLP).',
                'sort_order' => 1,
            ],
            [
                'category' => 'Pagos',
                'question' => '¿Es seguro pagar en la tienda?',
                'answer' => 'Sí. Todos los pagos se procesan a través de Flow, una pasarela de pago certificada. Nunca almacenamos los datos de tu tarjeta.',
                'sort_order' => 2,
            ],

            // ── VIPs ──────────────────────────────────────────────────
            [
                'category' => 'VIPs',
                'question' => '¿Cuánto dura mi VIP?',
                'answer' => 'La duración depende del paquete que compres. La mayoría de los VIPs duran 30 días desde su activación. Puedes ver la duración exacta en la página de cada producto.',
                'sort_order' => 1,
            ],
            [
                'category' => 'VIPs',
                'question' => '¿Qué beneficios incluye el VIP?',
                'answer' => 'Cada nivel de VIP incluye comandos exclusivos, tags en el chat, prioridad en la cola de entrada y beneficios adicionales según el paquete. Revisa la descripción de cada VIP en la tienda.',
                'sort_order' => 2,
            ],

            // ── General ───────────────────────────────────────────────
            [
                'category' => 'General',
                'question' => '¿Cómo me uno al servidor?',
                'answer' => 'Abre MTA:SA, ve a la sección de servidores y busca "Valparaíso RP", o conéctate directamente con la IP que encontrarás en nuestro Discord. ¡Te esperamos!',
                'sort_order' => 1,
            ],
            [
                'category' => 'General',
                'question' => '¿Necesito una cuenta para comprar?',
                'answer' => 'Sí. Debes iniciar sesión con Discord para realizar compras y vincular tus beneficios a tu cuenta del servidor.',
                'sort_order' => 2,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create([
                ...$faq,
                'is_active' => true,
            ]);
        }
    }
}
