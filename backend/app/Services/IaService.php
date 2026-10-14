<?php

namespace App\Services;

use App\Models\Reclamation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IaService
{
    private string $baseUrl;
    private int $timeout;
    private bool $enabled;

    public function __construct()
    {
        $this->baseUrl = config('services.ia.url');
        $this->timeout = config('services.ia.timeout', 30);
        $this->enabled = config('services.ia.enabled', true);
    }


    public function health(): ?array
    {
        if (!$this->enabled) return null;

        try {
            $res = Http::timeout(3)->get("{$this->baseUrl}/health");
            return $res->successful() ? $res->json() : null;
        } catch (\Throwable $e) {
            Log::debug('IA health check failed', ['error' => $e->getMessage()]);
            return null;
        }
    }


    public function classify(array $data): ?array
    {
        return $this->post('/classify', $data);
    }


    public function detectDuplicates(array $data): ?array
    {
        return $this->post('/detect-duplicates', $data);
    }


    public function summarize(array $data): ?array
    {
        return $this->post('/summarize', $data);
    }


    public function predictRecurrence(array $data): ?array
    {
        return $this->post('/predict-recurrence', $data);
    }


    private function post(string $endpoint, array $payload): ?array
    {
        if (!$this->enabled) return null;

        try {
            $res = Http::timeout($this->timeout)
                ->acceptJson()
                ->post("{$this->baseUrl}{$endpoint}", $payload);

            if (!$res->successful()) {
                Log::warning("IA {$endpoint} returned {$res->status()}");
                return null;
            }

            return $res->json();
        } catch (\Throwable $e) {
            Log::warning("IA {$endpoint} failed", ['error' => $e->getMessage()]);
            return null;
        }
    }
}