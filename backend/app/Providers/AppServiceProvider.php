<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Observers\ReclamationObserver;
use App\Models\Reclamation;
use App\Policies\ReclamationPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
   
    public function register(): void
    {
        //
    }

   
    public function boot(): void
    {
      
    Gate::policy(Reclamation::class, ReclamationPolicy::class);
    Reclamation::observe(ReclamationObserver::class);

    
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    
    RateLimiter::for('login', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });

    
    RateLimiter::for('create-reclamation', function (Request $request) {
        return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
    });


    }
}
