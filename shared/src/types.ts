// Servora shared types — consumed by web/ and mobile/ and vendor-app/.
// Mirrors the JSON shapes the CI3 API in api/ returns.

export type ApiEnvelope<T> = { status: boolean; message: string; data: T };
export type ApiError = { status: false; message: string; errors?: unknown };

export type Role = "customer" | "vendor" | "admin" | "super_admin";

export type User = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  is_active: 0 | 1;
  created_at: string;
};

export type City = { id: number; name: string; slug: string; state_id: number };
export type State = { id: number; name: string; slug: string };
export type Locality = { id: number; name: string; slug: string; city_id: number };

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  is_primary?: 0 | 1;
};

export type ServiceArea = {
  id: number;
  city_id: number;
  city_name: string;
  city_slug: string;
  is_active: 0 | 1;
};

/**
 * A "business" is a vendor — Servora's equivalent of a service provider.
 * The DB table is `businesses`; user-facing copy says "vendor".
 */
export type Business = {
  id: number;
  name: string;
  slug: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  pin_code?: string | null;
  description?: string | null;
  short_description?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  is_active: 0 | 1;
  is_verified: 0 | 1;
  is_featured: 0 | 1;
  avg_rating: number;
  total_reviews: number;
  owner_user_id?: number | null;
  city_id?: number | null;
  city_name?: string | null;
  city_slug?: string | null;
  state_id?: number | null;
  state_slug?: string | null;
  locality_id?: number | null;
  locality_name?: string | null;
  locality_slug?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  categories?: Category[];
  service_areas?: ServiceArea[];
  created_at: string;
  updated_at: string;
};

export type ServiceVariant = {
  id: number;
  name: string;
  price: number;
  duration_minutes?: number | null;
  is_active: 0 | 1;
  sort_order: number;
};

export type Service = {
  id: number;
  business_id: number;
  category_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  base_price: number;
  discounted_price?: number | null;
  price_unit: "fixed" | "per_hour" | "per_visit";
  duration_minutes: number;
  image?: string | null;
  is_active: 0 | 1;
  sort_order: number;
  variants?: ServiceVariant[];
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type Booking = {
  id: number;
  user_id: number;
  business_id: number;
  service_id?: number | null;
  variant_id?: number | null;
  address_id?: number | null;
  scheduled_at: string | null;
  amount_paise: number;
  currency: "INR";
  status: BookingStatus;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  notes?: string | null;
  created_at: string;
};

export type Review = {
  id: number;
  business_id: number;
  user_id?: number | null;
  booking_id?: number | null;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
  is_approved: 0 | 1;
  created_at: string;
};

export type Lead = {
  id: number;
  business_id: number;
  source: "search" | "listing" | "contact_form" | "phone_click";
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  status: "new" | "contacted" | "converted" | "dropped";
  created_at: string;
};

export type CreateOrderResponse = {
  data: {
    booking_id: number;
    razorpay_order_id: string;
    amount: number;
    currency: "INR";
    key_id: string;
  };
};

export type Pagination = {
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export type ListingResponse<T> = {
  engine?: "elasticsearch" | "mysql";
  businesses?: T[];
  pagination: Pagination;
};
