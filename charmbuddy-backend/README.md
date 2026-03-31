# Charmbuddy Backend (Laravel 12)

API backend untuk storefront + admin Charmbuddy.

## Prasyarat
- PHP 8.2+
- Composer
- MySQL atau SQLite

## Setup
1. Install dependency:
   ```bash
   composer install
   ```
2. Copy env:
   ```bash
   cp .env.example .env
   ```
3. Atur `.env` (minimal):
   ```env
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=charmbuddy
   DB_USERNAME=root
   DB_PASSWORD=

   RAJAONGKIR_API_KEY=isi_api_key_kamu
   RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1
   ```
4. Generate key + migrate + seed:
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   php artisan storage:link
   ```
5. Jalankan server:
   ```bash
   php artisan serve
   ```

## Akun Seed Default
- Admin
  - Email: `admin@charmbuddy.com`
  - Password: `password123`
- Customer
  - Email: `test@example.com`
  - Password: `password123`

## Endpoint Utama
- Public: `/api/products`, `/api/categories`, `/api/shipping/*`
- Auth: `/api/register`, `/api/login`, `/api/auth/me`, `/api/logout`
- Customer: `/api/cart/*`, `/api/checkout`, `/api/orders/*`, `/api/promo-codes/validate`
- Admin: `/api/admin/products`, `/api/admin/orders`, `/api/admin/payments`, `/api/admin/summary`

## Testing
```bash
php artisan test
```

## Troubleshooting
- `500` pada auth/cart: pastikan migrasi terbaru sudah jalan.
- Shipping gagal: pastikan `RAJAONGKIR_API_KEY` valid.
- Upload bukti bayar gagal: cek `storage:link` dan permission folder `storage/app/public`.
