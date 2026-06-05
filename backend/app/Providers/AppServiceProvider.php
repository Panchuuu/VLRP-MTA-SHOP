<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\ServiceProvider;
use SocialiteProviders\Manager\SocialiteWasCalled;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the Discord driver for Laravel Socialite (SocialiteProviders).
        Event::listen(function (SocialiteWasCalled $event) {
            $event->extendSocialite('discord', \SocialiteProviders\Discord\Provider::class);
        });

        // Apply the local CA bundle to every Http:: call (job, services, profile).
        // Belt-and-suspenders alongside php.ini's curl.cainfo.
        $cacert = env('CACERT_PATH');
        if ($cacert && file_exists($cacert)) {
            Http::globalOptions(['verify' => $cacert]);
        }
    }
}
