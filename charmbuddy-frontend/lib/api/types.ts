export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type PaginationMeta = {
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type Paginated<T> = {
  items: T[];
  meta?: PaginationMeta;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Category = {
  id: number;
  parent_id: number | null;
  name: string;
  children?: Category[];
};

export type FaqEntry = {
  id: number;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
};

export type ContentPage = {
  id?: number;
  key: string;
  title: string | null;
  body: string | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderStatusHistory = {
  id: number;
  order_id: number;
  status: string;
  note: string | null;
  changed_by: number | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  changedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type PromoCode = {
  id: number;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  min_subtotal: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProductImage = {
  id: number;
  image_path: string;
  is_primary: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  weight: number;
  image_path: string | null;
  category_id: number | null;
  category?: Category | null;
  images?: ProductImage[];
};

export type CartLine = {
  id: number;
  product_id: number;
  qty: number;
  quantity?: number;
  line_total: number;
  product: Product | null;
};

export type Cart = {
  id: number;
  items: CartLine[];
  total_items: number;
  subtotal: number;
};

export type ShippingOption = {
  courier: string;
  service: string;
  eta: string;
  cost: number;
};

export type UserAddress = {
  id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  notes: string | null;
  is_default: boolean;
};

export type ShippingProvince = {
  province_id: number;
  province: string;
};

export type ShippingCity = {
  city_id: number;
  province_id: number;
  city_name: string;
  type?: string;
};

export type ShippingOptionsPayload = {
  weight_grams: number;
  options: ShippingOption[];
};

export type CheckoutPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  shipping_courier: string;
  shipping_service: string;
  shipping_eta: string;
  shipping_cost: number;
  discount_code?: string;
};

export type DiscountValidation = {
  code: string;
  type: "fixed" | "percentage";
  value: number;
  discount_amount: number;
  subtotal: number;
  total_after_discount: number;
};

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string | null;
  image_path: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
};

export type Payment = {
  id: number;
  order_id: number;
  method: string;
  amount: number;
  proof_path: string | null;
  payment_proof_path?: string | null;
  status_review: "uploaded" | "approved" | "rejected";
  status?: "Pending" | "Approved" | "Rejected";
  note: string | null;
  verified_by: number | null;
  verified_at: string | null;
};

export type Order = {
  id: number;
  order_number: string;
  user_id: number;
  status: "pending" | "paid" | "sent" | "Pending" | "Paid" | "Processed" | "Shipped";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  description: string | null;
  shipping_courier: string;
  shipping_service: string;
  shipping_eta: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment?: Payment | null;
};

export type TrackingStep = {
  id: string;
  title: string;
  desc: string;
  active: boolean;
  at?: string | null;
};

export type OrderTrackingPayload = {
  order: Order;
  timeline: TrackingStep[];
};

export type PaymentProofUploadResult = {
  order: Order;
  payment?: Payment | null;
  proof_path?: string | null;
  proof_url?: string | null;
};

export type AdminPaginatedMeta = {
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type AdminOrderStatus = "Pending" | "Paid" | "Processed" | "Shipped";
export type AdminPaymentStatus = "Pending" | "Approved" | "Rejected";

export type AdminProductPayload = {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  weight: number;
  image?: File | null;
  image_path?: string;
};

export type AdminUserSummary = {
  id: number;
  name: string;
  email: string;
};

export type AdminOrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  quantity: number;
  price_at_checkout: string | number;
  subtotal: string | number;
  product?: Product | null;
};

export type AdminOrder = {
  id: number;
  user_id: number;
  cart_id: number | null;
  total_price: string | number;
  shipping_cost: string | number;
  shipping_address: string;
  courier_service: string;
  status: AdminOrderStatus;
  payment_proof_path: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  user?: AdminUserSummary;
  payment?: AdminPayment | null;
  items?: AdminOrderItem[];
};

export type AdminPayment = {
  id: number;
  user_id: number;
  order_id: number;
  amount: string | number;
  status: AdminPaymentStatus;
  payment_proof_path: string | null;
  created_at: string;
  updated_at: string;
  user?: AdminUserSummary;
  order?: AdminOrder | null;
};

export type AdminSummary = {
  total_orders: number;
  pending_payments: number;
  paid_orders: number;
  shipped_orders: number;
  revenue: number;
  low_stock_count: number;
  range: {
    from: string | null;
    to: string | null;
  };
};

export type AdminSalesReportRow = {
  order_id: number;
  order_number: string;
  order_date: string | null;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  items_count: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  tracking_number: string | null;
};

export type AdminSalesReport = {
  summary: {
    total_transactions: number;
    paid_transactions: number;
    pending_transactions: number;
    gross_revenue: number;
    total_shipping: number;
    total_discount: number;
  };
  range: {
    from: string | null;
    to: string | null;
    status: string | null;
  };
  rows: AdminSalesReportRow[];
};

export type AdminStockMovement = {
  id: number;
  product_id: number;
  type: "in" | "out" | "adjustment";
  quantity_change: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  source_type: string | null;
  source_id: number | null;
  note: string | null;
  changed_by: number | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  actor?: {
    id: number;
    name: string;
    email: string;
  } | null;
};
