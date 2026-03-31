<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * REGISTER: Membuat akun baru
     */
    public function register(Request $request)
    {
        // 1. Validasi Input dari Frontend
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8', // Minimal 8 karakter
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ada kesalahan input data.',
                'errors' => $validator->errors()
            ], 422); // 422 = Unprocessable Entity
        }

        // 2. Simpan User ke Database
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Password wajib di-hash!!!
            'role' => 'customer', // Default role user biasa
        ]);

        // 3. Buat Token (Tiket Masuk)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Kirim Balasan JSON ke Frontend
        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil!',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201); // 201 = Created
    }

    /**
     * LOGIN: Masuk dan minta Token
     */
    public function login(Request $request)
    {
        // 1. Cek Credentials (Email & Password)
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah.'
            ], 401); // 401 = Unauthorized
        }

        // 2. Ambil Data User yang berhasil login
        $user = User::where('email', $request->email)->firstOrFail();

        // 3. Buat Token Baru
        // (Opsional: Hapus token lama biar gak numpuk)
        // $user->tokens()->delete(); 
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Kirim Balasan
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 200);
    }

    /**
     * LOGOUT: Hapus Token (Keluar)
     */
    public function logout(Request $request)
    {
        $currentToken = $request->user()?->currentAccessToken();
        $bearerToken = $request->bearerToken();

        if ($currentToken && method_exists($currentToken, 'delete')) {
            $currentToken->delete();
        } elseif ($bearerToken) {
            $tokenId = null;
            $plainToken = $bearerToken;

            if (Str::contains($bearerToken, '|')) {
                [$tokenIdRaw, $plainTokenRaw] = explode('|', $bearerToken, 2);
                $tokenId = (int) $tokenIdRaw;
                $plainToken = $plainTokenRaw;
            }

            $query = PersonalAccessToken::query()->where('token', hash('sha256', $plainToken));
            if ($tokenId !== null) {
                $query->where('id', $tokenId);
            }

            $query->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.'
        ]);
    }
}
