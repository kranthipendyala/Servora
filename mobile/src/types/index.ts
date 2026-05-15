export interface City {
  id: number;
  name: string;
  slug: string;
  state: string;
  business_count: number;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  parent_id: number | null;
  business_count: number;
  description: string;
  is_active: boolean;
  children?: Category[];
}

export interface Business {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  city_id: number;
  city_name: string;
  city_slug: string;
  locality: string;
  locality_slug: string;
  pincode: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  logo: string;
  cover_image: string;
  categories: BusinessCategory[];
  working_hours: WorkingHours[];
  average_rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WorkingHours {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  business_id: number;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface Locality {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  city_name: string;
  business_count: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  created_at: string;
}

export interface Enquiry {
  id: number;
  business_id: number;
  business_name: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message: string;
  total?: number;
  page?: number;
  per_page?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ReviewRequest {
  business_id: number;
  rating: number;
  title: string;
  comment: string;
}

export interface EnquiryRequest {
  business_id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  category?: string;
  locality?: string;
  rating?: number;
  verified?: boolean;
  sort?: 'relevance' | 'rating' | 'reviews' | 'newest';
  page?: number;
  per_page?: number;
}

export interface RatingBreakdown {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
  total: number;
  average: number;
}

// ---- Marketplace Types ----

export interface Service {
  id: number;
  business_id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  base_price: number;
  discounted_price?: number;
  price_unit: 'fixed' | 'per_hour' | 'per_sqft' | 'per_unit';
  duration_minutes: number;
  image?: string;
  is_active: boolean;
  category_name?: string;
  variants?: ServiceVariant[];
}

export interface ServiceVariant {
  id: number;
  name: string;
  price: number;
  duration_minutes?: number;
}

export interface Address {
  id: number;
  label: string;
  full_name?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city_name?: string;
  locality_name?: string;
  state_name?: string;
  pin_code: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface BookingItem {
  service_id: number;
  variant_id?: number;
  service_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'partially_refunded' | 'refunded' | 'failed';

export interface Booking {
  id: number;
  booking_number: string;
  customer_id: number;
  vendor_id: number;
  business_id: number;
  scheduled_date: string;
  scheduled_time: string;
  status: BookingStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string;
  cancellation_reason?: string;
  customer_notes?: string;
  vendor_notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  customer_name?: string;
  vendor_name?: string;
  business_name?: string;
  business_slug?: string;
  items?: BookingItem[];
  address?: Address;
}

export interface PaymentOrder {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  booking_number: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface CreateBookingRequest {
  business_id: number;
  items: { service_id: number; variant_id?: number; quantity?: number }[];
  scheduled_date: string;
  scheduled_time: string;
  address_id?: number;
  service_address?: string;
  customer_notes?: string;
}
