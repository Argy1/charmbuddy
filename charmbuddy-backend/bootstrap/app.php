<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust reverse proxies (load balancers, Vercel, Cloudflare, etc.) so that
        // $request->ip() returns the real client IP and throttle works correctly.
        // Production hosts such as Railway terminate TLS before Laravel, so trust
        // forwarded headers by default there. Local development stays restricted.
        $trustedProxies = env(
            'TRUSTED_PROXIES',
            env('APP_ENV') === 'production' ? '*' : '127.0.0.1,::1'
        );
        $middleware->trustProxies(
            at: $trustedProxies,
            headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR
                | \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST
                | \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT
                | \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO
        );

        // CORS must run before SecurityHeaders so preflight exits early
        $middleware->prepend(\App\Http\Middleware\HandleCors::class);
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Global API throttle: 60 requests/minute per user/IP
        $middleware->throttleApi();

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return consistent JSON for all uncaught exceptions on API routes
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null; // let default handler deal with web routes
            }

            $status = match (true) {
                method_exists($e, 'getStatusCode') => $e->getStatusCode(),
                $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException => 404,
                $e instanceof \Illuminate\Auth\AuthenticationException => 401,
                $e instanceof \Illuminate\Auth\Access\AuthorizationException => 403,
                $e instanceof \Illuminate\Validation\ValidationException => 422,
                default => 500,
            };

            // Never expose internal details in production for 5xx errors
            $isInternalError = $status >= 500;
            $message = ($isInternalError && app()->environment('production'))
                ? 'An internal server error occurred.'
                : ($e->getMessage() ?: 'An error occurred.');

            return response()->json([
                'success' => false,
                'message' => $message,
            ], $status);
        });
    })->create();
