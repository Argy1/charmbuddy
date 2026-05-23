<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    private function allowedOrigins(): array
    {
        $default = implode(',', [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
        ]);

        return array_values(array_filter(
            array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', $default)))
        ));
    }

    private function corsHeaders(string $origin): array
    {
        return [
            'Access-Control-Allow-Origin'      => $origin,
            'Access-Control-Allow-Methods'     => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With, Accept',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age'           => '86400',
        ];
    }

    private function removeCorsHeaders(Response $response): void
    {
        foreach ([
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Credentials',
            'Access-Control-Max-Age',
        ] as $header) {
            $response->headers->remove($header);
        }
    }

    public function handle(Request $request, Closure $next): Response
    {
        $origin = (string) $request->header('Origin', '');
        $originAllowed = $origin !== '' && in_array($origin, $this->allowedOrigins(), true);

        // Short-circuit preflight before hitting the application stack
        if ($request->isMethod('OPTIONS')) {
            $headers = $originAllowed ? $this->corsHeaders($origin) : [];
            // Always include Vary: Origin on preflight so proxies cache per-origin
            $headers['Vary'] = 'Origin';

            return response('', 204, $headers);
        }

        $response = $next($request);

        if ($originAllowed) {
            foreach ($this->corsHeaders($origin) as $key => $value) {
                $response->headers->set($key, $value);
            }
        } else {
            $this->removeCorsHeaders($response);
        }

        // Always set Vary: Origin so reverse proxies know responses differ by origin
        $existing = $response->headers->get('Vary', '');
        $varyValues = array_filter(array_map('trim', explode(',', $existing)));
        if (! in_array('Origin', $varyValues, true)) {
            $varyValues[] = 'Origin';
        }
        $response->headers->set('Vary', implode(', ', $varyValues));

        return $response;
    }
}
