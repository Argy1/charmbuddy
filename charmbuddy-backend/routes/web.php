<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

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
