<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        Vite::prefetch(concurrency: 3);

        // Configurar Carbon en español
        Carbon::setLocale('es');

        // Configurar locale del sistema con fallback
        try {
            $locales = ['es_SV.UTF-8', 'es_SV', 'Spanish_El Salvador.1252', 'es_ES.UTF-8'];
            foreach ($locales as $locale) {
                if (setlocale(LC_ALL, $locale)) {
                    break;
                }
            }
        } catch (\Exception $e) {
            Log::warning('No se pudo configurar locale español: ' . $e->getMessage());
        }
    }
}
