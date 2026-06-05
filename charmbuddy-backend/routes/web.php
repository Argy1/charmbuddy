<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/products/{path}', function (string $path) {
    $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');

    if (str_contains($normalizedPath, '..')) {
        abort(404);
    }

    $storagePath = 'products/'.$normalizedPath;
    if (Storage::disk('public')->exists($storagePath)) {
        $mimeType = Storage::disk('public')->mimeType($storagePath) ?: 'application/octet-stream';

        return response()->stream(function () use ($storagePath) {
            echo Storage::disk('public')->get($storagePath);
        }, 200, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    $publicPath = public_path('products/'.$normalizedPath);
    if (! is_file($publicPath)) {
        abort(404);
    }

    return response()->file($publicPath, [
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('path', '.*');

Route::get('/storage/{path}', function (string $path) {
    $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');

    if (str_contains($normalizedPath, '..') || ! Storage::disk('public')->exists($normalizedPath)) {
        abort(404);
    }

    $mimeType = Storage::disk('public')->mimeType($normalizedPath) ?: 'application/octet-stream';

    return response()->stream(function () use ($normalizedPath) {
        echo Storage::disk('public')->get($normalizedPath);
    }, 200, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('path', '.*');
