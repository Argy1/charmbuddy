# Charmbuddy Frontend (Next.js)

Frontend storefront + admin dashboard untuk Charmbuddy.

## Prasyarat
- Node.js 20+
- npm 10+
- Backend `charmbuddy-backend` aktif di lokal

## Setup
1. Install dependency:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env
   ```
3. Isi `.env`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_SHIPPING_ORIGIN_ID=501
   NEXT_PUBLIC_SHIPPING_DESTINATION_ID=114
   ```
4. Jalankan dev server:
   ```bash
   npm run dev
   ```

## Quality Commands
```bash
npm run lint
npm run build
```

## Fitur Integrasi Utama
- Auth bearer token (login/register/me/logout)
- Catalogue/search/product dari API backend
- Cart server-side + merge guest cart
- Checkout + validasi voucher
- Upload payment proof
- Tracking status order
- Admin dashboard (`/admin`) untuk products/orders/payments

## Troubleshooting
- `Request failed with status 500`: pastikan backend sudah `migrate --seed`, env benar, dan server backend berjalan.
- Shipping kosong: cek `RAJAONGKIR_API_KEY` di backend.
- Gagal load gambar API: pastikan `NEXT_PUBLIC_API_BASE_URL` mengarah ke host backend yang benar.
