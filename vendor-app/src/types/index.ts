export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  business_id?: number;
  business_name?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Address {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface ServiceVariant {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
}

export interface Service {
  id: number;
  business_id: number;
  category_id: number;
  category_name?: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  discounted_price?: number;
  price_unit: string;
  duration_minutes: number;
  is_active: boolean;
  variants?: ServiceVariant[];
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: number;
  service_id: number;
  service_name: string;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Booking {
  id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  business_id: number;
  business_name: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  items: BookingItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  scheduled_date: string;
  scheduled_time: string;
  address?: Address;
  vendor_notes?: string;
  customer_notes?: string;
  cancellation_reason?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorStats {
  total_bookings: number;
  pending_bookings: number;
  today_jobs: number;
  total_earnings: number;
  completed_bookings: number;
  average_rating: number;
  total_reviews: number;
  this_month_earnings: number;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_services: number;
  max_bookings_per_month: number;
  priority_listing: boolean;
  analytics_access: boolean;
  is_popular: boolean;
}

export interface Subscription {
  id: number;
  plan_id: number;
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  amount: number;
  auto_renew: boolean;
}

export interface Payout {
  id: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
  reference_id?: string;
  period_start: string;
  period_end: string;
  bookings_count: number;
  created_at: string;
  completed_at?: string;
}

export interface BankDetails {
  id?: number;
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name?: string;
  upi_id?: string;
  is_verified: boolean;
}

export interface VendorDocument {
  id: number;
  type: 'identity' | 'address_proof' | 'business_license' | 'gst_certificate' | 'other';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
  verified_at?: string;
}

export interface Review {
  id: number;
  booking_id: number;
  customer_id: number;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  comment?: string;
  reply?: string;
  replied_at?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Availability {
  day: number;
  day_name: string;
  is_available: boolean;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
}

export interface CreateServiceRequest {
  name: string;
  category_id: number;
  base_price: number;
  discounted_price?: number;
  price_unit: string;
  duration_minutes: number;
  description?: string;
  variants?: Omit<ServiceVariant, 'id'>[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}
