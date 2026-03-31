# Charmbuddy Monorepo

Repository ini berisi 2 project terpisah:

- `charmbuddy-frontend` (Next.js - deploy ke Vercel)
- `charmbuddy-backend` (Laravel API - deploy ke server backend terpisah)

## Struktur

- `charmbuddy-frontend/`
- `charmbuddy-backend/`

## Deploy Frontend ke Vercel

1. Import repo ini ke Vercel.
2. Saat membuat project, set **Root Directory** ke `charmbuddy-frontend`.
3. Set environment variable frontend:
   - `NEXT_PUBLIC_API_BASE_URL` = URL backend Laravel kamu (contoh: `https://api-charmbuddy.example.com/api`)
   - `NEXT_PUBLIC_SHIPPING_ORIGIN_ID` (opsional)
4. Deploy.

## Deploy Backend (Laravel)

Deploy `charmbuddy-backend` di hosting PHP/Laravel (Railway/Render/VPS, dll):

1. Set `.env` backend.
2. Jalankan:
   - `composer install --no-dev --optimize-autoloader`
   - `php artisan key:generate`
   - `php artisan migrate --force`
3. Konfigurasi web server ke folder `public/`.
4. Aktifkan storage link jika perlu: `php artisan storage:link`.

## Catatan

Frontend dan backend tidak dijalankan dari platform yang sama secara default. Untuk production, backend harus online dulu lalu URL API dipasang di env Vercel.
