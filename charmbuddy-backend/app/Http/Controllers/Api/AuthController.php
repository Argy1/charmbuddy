<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email:rfc|max:255|unique:users',
            // Min 8 chars, must contain at least one letter and one number
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
        ], [
            'password.regex' => 'Password harus mengandung minimal satu huruf dan satu angka.',
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
        $this->pruneTokens($user);
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
        // 1. Validasi keberadaan field sebelum Auth::attempt()
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email|max:255',
            'password' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ada kesalahan input data.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 2. Cek Credentials (Email & Password)
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah.'
            ], 401); // 401 = Unauthorized
        }

        // 2. Ambil Data User yang berhasil login
        $user = User::where('email', $request->email)->firstOrFail();

        // 3. Buat Token Baru
        $this->pruneTokens($user);
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
     * UPDATE PROFILE: Edit nama, email, atau password
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'             => 'sometimes|string|max:255',
            'email'            => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'avatar'           => 'sometimes|file|image|mimes:jpg,jpeg,png,webp|max:2048',
            'current_password' => 'required_with:new_password|string',
            'new_password'     => ['sometimes', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ada kesalahan input data.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password saat ini salah.',
                    'errors'  => ['current_password' => ['Password saat ini salah.']],
                ], 422);
            }
            $user->password = Hash::make($request->new_password);
        }

        if ($request->filled('name'))  { $user->name  = $request->name; }
        if ($request->filled('email')) { $user->email = $request->email; }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data'    => $user,
        ]);
    }

    /**
     * Delete expired tokens and cap the total per user to prevent unbounded growth.
     */
    private function pruneTokens(\App\Models\User $user): void
    {
        $expirationMinutes = config('sanctum.expiration');

        // Remove tokens that are past their expiration
        if ($expirationMinutes) {
            $user->tokens()
                ->where('created_at', '<', now()->subMinutes($expirationMinutes))
                ->delete();
        }

        // Keep at most 5 active tokens per user (delete oldest beyond limit)
        $maxTokens = 5;
        $count = $user->tokens()->count();
        if ($count >= $maxTokens) {
            $user->tokens()
                ->oldest()
                ->limit($count - $maxTokens + 1)
                ->get()
                ->each->delete();
        }
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
