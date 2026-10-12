<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Observers\ReclamationObserver;
use App\Models\Reclamation;
use App\Policies\ReclamationPolicy;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

   
    public function boot(): void
    {
      
    Gate::policy(Reclamation::class, ReclamationPolicy::class);
    Reclamation::observe(ReclamationObserver::class);

    }
}
