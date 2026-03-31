export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  image: string;
  description: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  type: string;
  color: string;
  qty: number;
  unitPrice: number;
  image: string;
};

export type Order = {
  id: string;
  transactionId: string;
  dateLabel: string;
  statusLabel: string;
  total: number;
  items: OrderItem[];
};

export const mockProducts: Product[] = [
  {
    id: "p-1",
    slug: "diamond-necklace",
    name: "Diamond Necklace",
    category: "Necklace",
    price: 23,
    oldPrice: 27,
    rating: 4.9,
    image: "/catalogue/product-image.png",
    description: "Handcrafted necklace with premium bloom charm details.",
  },
  {
    id: "p-2",
    slug: "diamond-ring",
    name: "Diamond Ring",
    category: "Ring",
    price: 19,
    oldPrice: 24,
    rating: 4.8,
    image: "/catalogue/product-image.png",
    description: "Elegant ring design for daily charm styling.",
  },
  {
    id: "p-3",
    slug: "silver-bracelet",
    name: "Silver Bracelet",
    category: "Bracelet",
    price: 15,
    oldPrice: 19,
    rating: 4.7,
    image: "/catalogue/product-image.png",
    description: "Minimal silver bracelet with polished bloom finish.",
  },
  {
    id: "p-4",
    slug: "heart-charm",
    name: "Heart Charm",
    category: "Bag Charm",
    price: 12,
    oldPrice: 15,
    rating: 4.9,
    image: "/catalogue/product-image.png",
    description: "Cute heart charm to customize your everyday accessories.",
  },
  {
    id: "p-5",
    slug: "moon-phonstrap",
    name: "Moon Phonstrap",
    category: "Phonstrap",
    price: 10,
    oldPrice: 13,
    rating: 4.6,
    image: "/catalogue/product-image.png",
    description: "Soft-tone phonstrap with moon inspired detail.",
  },
  {
    id: "p-6",
    slug: "bloom-crochet",
    name: "Bloom Crochet",
    category: "Crochet Stuff",
    price: 17,
    oldPrice: 21,
    rating: 4.8,
    image: "/catalogue/product-image.png",
    description: "Handmade crochet bloom accessory.",
  },
];

export const mockOrders: Order[] = [
  {
    id: "1",
    transactionId: "#JK893",
    dateLabel: "Fri, 10th Aug 2027, 05:32 PM",
    statusLabel: "Waiting Delivery",
    total: 123,
    items: [
      { id: "1-1", productId: "p-1", name: "Diamond Necklace", type: "Necklace", color: "Silver", qty: 2, unitPrice: 13, image: "/order-history/product-image.png" },
      { id: "1-2", productId: "p-2", name: "Diamond Ring", type: "Ring", color: "Silver", qty: 2, unitPrice: 13, image: "/order-history/product-image.png" },
      { id: "1-3", productId: "p-3", name: "Silver Bracelet", type: "Bracelet", color: "Silver", qty: 2, unitPrice: 13, image: "/order-history/product-image.png" },
      { id: "1-4", productId: "p-4", name: "Heart Charm", type: "Charm", color: "Silver", qty: 2, unitPrice: 13, image: "/order-history/product-image.png" },
    ],
  },
  {
    id: "2",
    transactionId: "#AB224",
    dateLabel: "Thu, 9th Aug 2027, 10:15 AM",
    statusLabel: "Shipped",
    total: 96,
    items: [
      { id: "2-1", productId: "p-2", name: "Diamond Ring", type: "Ring", color: "Silver", qty: 1, unitPrice: 24, image: "/order-history/product-image.png" },
      { id: "2-2", productId: "p-3", name: "Silver Bracelet", type: "Bracelet", color: "Silver", qty: 2, unitPrice: 12, image: "/order-history/product-image.png" },
      { id: "2-3", productId: "p-1", name: "Diamond Necklace", type: "Necklace", color: "Silver", qty: 1, unitPrice: 36, image: "/order-history/product-image.png" },
    ],
  },
];

export const statusTimeline = [
  { id: "delivered", title: "Delivered", desc: "Your order has been delivered", date: "Aug 12" },
  { id: "out", title: "Out for Delivery", desc: "Your package is on the way", date: "Aug 11" },
  { id: "transit", title: "In Transit", desc: "Your package is on the way", date: "Aug 10" },
  { id: "processed", title: "Order Processed", desc: "We've Preparing your order", date: "Aug 9" },
  { id: "placed", title: "Order Placed", desc: "We've received your order", date: "Aug 9" },
] as const;

export const statusRouteInfo = {
  from: "Jakarta",
  to: "Bogor",
  packageInfo: "Small Package | Aug 13, 1:23 PM",
  category: "Jewelry & Accessories",
  courier: "JNE -",
  eta: "1 Day",
  total: 123,
} as const;

export function getProductBySlug(slug: string) {
  return mockProducts.find((item) => item.slug === slug) ?? mockProducts[0];
}

