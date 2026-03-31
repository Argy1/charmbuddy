<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = Address::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $addresses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $userId = $request->user()->id;

        $address = DB::transaction(function () use ($validated, $userId) {
            $isDefault = (bool) ($validated['is_default'] ?? false);

            if ($isDefault) {
                Address::query()->where('user_id', $userId)->update(['is_default' => false]);
            }

            $validated['user_id'] = $userId;
            $validated['is_default'] = $isDefault;

            return Address::create($validated);
        });

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil ditambahkan.',
            'data' => $address,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'recipient_name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:30'],
            'address_line' => ['sometimes', 'required', 'string'],
            'city' => ['sometimes', 'required', 'string', 'max:255'],
            'province' => ['sometimes', 'required', 'string', 'max:255'],
            'postal_code' => ['sometimes', 'required', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $address = Address::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        DB::transaction(function () use ($validated, $request, $address) {
            if (array_key_exists('is_default', $validated) && $validated['is_default']) {
                Address::query()->where('user_id', $request->user()->id)->update(['is_default' => false]);
            }

            $address->update($validated);
        });

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil diperbarui.',
            'data' => $address->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = Address::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus.',
        ]);
    }
}

