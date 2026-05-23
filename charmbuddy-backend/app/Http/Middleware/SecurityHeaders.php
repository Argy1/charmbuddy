<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent MIME-type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Deny framing (clickjacking protection)
        $response->headers->set('X-Frame-Options', 'DENY');

        // Legacy XSS filter for old browsers
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Limit referrer information leakage
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Disable dangerous browser features
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
        );

        // Prevent Flash / Acrobat cross-domain requests to this API
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // Prevent other sites from embedding API responses (spectre/side-channel attacks)
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-site');

        // Force HTTPS when running under TLS
        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // Prevent sensitive API responses from being stored in shared/private caches
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            $response->headers->set('Pragma', 'no-cache');
        }

        // Remove headers that leak implementation details
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        // Remove PHP-level X-Powered-By before it is sent
        if (function_exists('header_remove')) {
            @header_remove('X-Powered-By');
        }

        return $response;
    }
}
