# Charmbuddy Product Upload Checklist (Admin Backend Source)

Dokumen ini jadi acuan saat input produk ke **Admin > Products** agar gambar, deskripsi, dan metadata konsisten di seluruh web (Home, Catalogue, Search, Product Detail, Cart).

## 1) Lokasi Aset

- Produk: `public/products/`
- Testimoni: `public/testimonials/testimonial-main.jpeg`
- Brand asset: `public/home/brand/`

## 2) Mapping Produk (Siap Upload)

| SKU | Name | Category | Price | Stock | Image Path | Marketing Description |
|---|---|---:|---:|---:|---|---|
| CB-PROD-001 | Clara Bow Classic | Necklace | 27 | 25 | `/products/clara-bow.png` | Kalung bergaya manis dengan detail pita yang halus, cocok untuk mempertegas look feminin sehari-hari. Finishing-nya ringan dipakai, mudah dipadukan untuk gaya kasual sampai semi-formal. |
| CB-PROD-002 | Clara Bow Signature | Necklace | 29 | 20 | `/products/clara-bow-2.png` | Versi statement dari koleksi Clara Bow dengan karakter visual yang lebih menonjol. Desain ini cocok jadi pusat perhatian outfit tanpa terasa berlebihan. |
| CB-PROD-003 | Clara Bow Soft Edition | Necklace | 26 | 18 | `/products/clara-bow-alt.png` | Nuansa lebih lembut untuk kamu yang suka aksesori elegan namun tetap playful. Ideal untuk layering dengan chain tipis atau dipakai sendiri sebagai aksen clean look. |
| CB-PROD-004 | Charm Rizz Original | Bag Charm | 21 | 30 | `/products/charm-rizz.png` | Bag charm dengan vibe fun yang langsung memberi karakter pada tas atau pouch favoritmu. Ringan, mudah dipasang, dan cocok jadi aksen personal yang standout. |
| CB-PROD-005 | Charm Rizz Duo | Bag Charm | 23 | 22 | `/products/charm-rizz-2.png` | Desain duo dengan komposisi charm lebih kaya sehingga tampilan tas terlihat lebih hidup. Pilihan tepat untuk daily styling yang ekspresif dan unik. |
| CB-PROD-006 | Charm Rizz Duo Alt | Bag Charm | 23 | 22 | `/products/charm-rizz-2-alt.png` | Alternatif warna/detail dari seri Charm Rizz Duo untuk kamu yang suka variasi visual. Tetap playful, tetap ringan, dan mudah dipadukan ke berbagai style. |
| CB-PROD-007 | Custom Ganci | Bag Charm | 18 | 40 | `/products/custom-ganci.png` | Ganci custom yang dirancang untuk menonjolkan identitas personalmu. Cocok sebagai hadiah unik maupun aksesoris harian yang meaningful. |
| CB-PROD-008 | Custom Ganci Variant 2 | Bag Charm | 19 | 35 | `/products/custom-ganci-2.png` | Varian kedua dengan komposisi elemen visual yang lebih playful. Memberi tampilan fresh pada tas, zipper, atau keyset favoritmu. |
| CB-PROD-009 | Custom Ganci Variant 3 | Bag Charm | 19 | 35 | `/products/custom-ganci-3.png` | Varian ketiga untuk kamu yang ingin gaya lebih standout. Detailnya tetap clean sehingga mudah dipakai untuk style kasual maupun street look. |
| CB-PROD-010 | Dreamscape Charm | Phone Strap | 24 | 28 | `/products/dreamscape-1.png` | Phone strap bernuansa dreamy dengan kombinasi warna yang menenangkan. Nyaman dipakai harian dan menambah sentuhan estetik pada gadget kamu. |
| CB-PROD-011 | Bingo Keepers | Bag Charm | 20 | 26 | `/products/bingo-keepers.png` | Koleksi bag charm dengan karakter fun-pop yang kuat. Cocok untuk kamu yang ingin tampilan tas lebih expressive tanpa kehilangan kesan rapi. |
| CB-PROD-012 | Tiny Keepers | Bag Charm | 17 | 32 | `/products/tiny-keepers.png` | Versi mini yang simpel tapi tetap eye-catching. Ukurannya compact, ideal untuk daily carry dan mudah dicampur dengan aksesori lainnya. |

## 3) Checklist Input Admin

- [ ] Setiap produk memiliki `name`, `category`, `price`, `stock`, `description`, dan `image`.
- [ ] `image_path` tersimpan valid dan tampil di Home/Catalogue/Search/Product Detail.
- [ ] Tidak ada gambar pecah atau fallback image di halaman publik.
- [ ] Uji alur Search -> Product Detail -> Add to Cart (gambar harus sama).

## 4) Brand Asset yang Dipakai UI

- Header logo: `/home/brand/logo-primary.png`
- Footer logo: `/home/brand/logo-badge-dark.png`
- Sticker dekorasi: `/home/brand/sticker-blue.png`, `/home/brand/sticker-lime.png`
