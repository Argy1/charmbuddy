export type ProductUploadManifestItem = {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
};

export const productUploadManifest: ProductUploadManifestItem[] = [
  {
    sku: "CB-PROD-001",
    name: "Clara Bow Classic",
    category: "Necklace",
    price: 27,
    stock: 25,
    image: "/products/clara-bow.png",
    description:
      "Kalung bergaya manis dengan detail pita yang halus, cocok untuk mempertegas look feminin sehari-hari. Finishing-nya ringan dipakai, mudah dipadukan untuk gaya kasual sampai semi-formal.",
  },
  {
    sku: "CB-PROD-002",
    name: "Clara Bow Signature",
    category: "Necklace",
    price: 29,
    stock: 20,
    image: "/products/clara-bow-2.png",
    description:
      "Versi statement dari koleksi Clara Bow dengan karakter visual yang lebih menonjol. Desain ini cocok jadi pusat perhatian outfit tanpa terasa berlebihan.",
  },
  {
    sku: "CB-PROD-003",
    name: "Clara Bow Soft Edition",
    category: "Necklace",
    price: 26,
    stock: 18,
    image: "/products/clara-bow-alt.png",
    description:
      "Nuansa lebih lembut untuk kamu yang suka aksesori elegan namun tetap playful. Ideal untuk layering dengan chain tipis atau dipakai sendiri sebagai aksen clean look.",
  },
  {
    sku: "CB-PROD-004",
    name: "Charm Rizz Original",
    category: "Bag Charm",
    price: 21,
    stock: 30,
    image: "/products/charm-rizz.png",
    description:
      "Bag charm dengan vibe fun yang langsung memberi karakter pada tas atau pouch favoritmu. Ringan, mudah dipasang, dan cocok jadi aksen personal yang standout.",
  },
  {
    sku: "CB-PROD-005",
    name: "Charm Rizz Duo",
    category: "Bag Charm",
    price: 23,
    stock: 22,
    image: "/products/charm-rizz-2.png",
    description:
      "Desain duo dengan komposisi charm lebih kaya sehingga tampilan tas terlihat lebih hidup. Pilihan tepat untuk daily styling yang ekspresif dan unik.",
  },
  {
    sku: "CB-PROD-006",
    name: "Charm Rizz Duo Alt",
    category: "Bag Charm",
    price: 23,
    stock: 22,
    image: "/products/charm-rizz-2-alt.png",
    description:
      "Alternatif warna/detail dari seri Charm Rizz Duo untuk kamu yang suka variasi visual. Tetap playful, tetap ringan, dan mudah dipadukan ke berbagai style.",
  },
  {
    sku: "CB-PROD-007",
    name: "Custom Ganci",
    category: "Bag Charm",
    price: 18,
    stock: 40,
    image: "/products/custom-ganci.png",
    description:
      "Ganci custom yang dirancang untuk menonjolkan identitas personalmu. Cocok sebagai hadiah unik maupun aksesoris harian yang meaningful.",
  },
  {
    sku: "CB-PROD-008",
    name: "Custom Ganci Variant 2",
    category: "Bag Charm",
    price: 19,
    stock: 35,
    image: "/products/custom-ganci-2.png",
    description:
      "Varian kedua dengan komposisi elemen visual yang lebih playful. Memberi tampilan fresh pada tas, zipper, atau keyset favoritmu.",
  },
  {
    sku: "CB-PROD-009",
    name: "Custom Ganci Variant 3",
    category: "Bag Charm",
    price: 19,
    stock: 35,
    image: "/products/custom-ganci-3.png",
    description:
      "Varian ketiga untuk kamu yang ingin gaya lebih standout. Detailnya tetap clean sehingga mudah dipakai untuk style kasual maupun street look.",
  },
  {
    sku: "CB-PROD-010",
    name: "Dreamscape Charm",
    category: "Phone Strap",
    price: 24,
    stock: 28,
    image: "/products/dreamscape-1.png",
    description:
      "Phone strap bernuansa dreamy dengan kombinasi warna yang menenangkan. Nyaman dipakai harian dan menambah sentuhan estetik pada gadget kamu.",
  },
  {
    sku: "CB-PROD-011",
    name: "Bingo Keepers",
    category: "Bag Charm",
    price: 20,
    stock: 26,
    image: "/products/bingo-keepers.png",
    description:
      "Koleksi bag charm dengan karakter fun-pop yang kuat. Cocok untuk kamu yang ingin tampilan tas lebih expressive tanpa kehilangan kesan rapi.",
  },
  {
    sku: "CB-PROD-012",
    name: "Tiny Keepers",
    category: "Bag Charm",
    price: 17,
    stock: 32,
    image: "/products/tiny-keepers.png",
    description:
      "Versi mini yang simpel tapi tetap eye-catching. Ukurannya compact, ideal untuk daily carry dan mudah dicampur dengan aksesori lainnya.",
  },
];
