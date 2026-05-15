import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import type {
  ApiResponse,
  Business,
  Category,
  City,
  Locality,
  Review,
  User,
  LoginRequest,
  RegisterRequest,
  ReviewRequest,
  EnquiryRequest,
  SearchFilters,
  Enquiry,
  RatingBreakdown,
  Service,
  Booking,
  Address,
  Notification,
  PaymentOrder,
  CreateBookingRequest,
} from '../types';

const ANDROID_EMULATOR_HOST = 'http://10.0.2.2/Servora/api/api';
const IOS_SIMULATOR_HOST = 'http://localhost/Servora/api/api';

export const BASE_URL = Platform.select({
  android: ANDROID_EMULATOR_HOST,
  ios: IOS_SIMULATOR_HOST,
  default: IOS_SIMULATOR_HOST,
});

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    // silently fail
  }
}

export async function clearToken(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch {
    // silently fail
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // silently fail
  }
}

export async function getSavedUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const {method = 'GET', body, params, requiresAuth = false} = options;

  let url = `${BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const json = await response.json();

    if (!response.ok) {
      return {
        status: false,
        data: {} as T,
        message: json.message || `HTTP Error ${response.status}`,
      };
    }

    return json as ApiResponse<T>;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Network error. Please check your connection.';
    return {
      status: false,
      data: {} as T,
      message,
    };
  }
}

export async function getCities(): Promise<ApiResponse<City[]>> {
  return fetchApi<City[]>('/cities');
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return fetchApi<Category[]>('/categories');
}

export async function getCategory(slug: string): Promise<ApiResponse<Category>> {
  return fetchApi<Category>(`/categories/${slug}`);
}

export async function getBusinesses(
  filters: SearchFilters = {},
): Promise<ApiResponse<Business[]>> {
  const params: Record<string, string | number | boolean | undefined> = {};
  if (filters.city) params.city = filters.city;
  if (filters.category) params.category = filters.category;
  if (filters.locality) params.locality = filters.locality;
  if (filters.rating) params.rating = filters.rating;
  if (filters.verified !== undefined) params.verified = filters.verified;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;
  if (filters.query) params.q = filters.query;

  return fetchApi<Business[]>('/businesses', {params});
}

export async function getBusiness(
  citySlug: string,
  businessSlug: string,
): Promise<ApiResponse<Business>> {
  return fetchApi<Business>(`/businesses/${citySlug}/${businessSlug}`);
}

export async function searchBusinesses(
  query: string,
  city?: string,
): Promise<ApiResponse<Business[]>> {
  return fetchApi<Business[]>('/businesses/search', {
    params: {q: query, city},
  });
}

export async function getLocalities(
  citySlug: string,
): Promise<ApiResponse<Locality[]>> {
  return fetchApi<Locality[]>(`/localities/${citySlug}`);
}

export async function getBusinessReviews(
  businessId: number,
): Promise<ApiResponse<{reviews: Review[]; breakdown: RatingBreakdown}>> {
  return fetchApi<{reviews: Review[]; breakdown: RatingBreakdown}>(
    `/businesses/${businessId}/reviews`,
  );
}

export async function login(
  credentials: LoginRequest,
): Promise<ApiResponse<{token: string; user: User}>> {
  const response = await fetchApi<{token: string; user: User}>('/auth/login', {
    method: 'POST',
    body: credentials as unknown as Record<string, unknown>,
  });

  if (response.status && response.data.token) {
    await setToken(response.data.token);
    await saveUser(response.data.user);
  }

  return response;
}

export async function register(
  data: RegisterRequest,
): Promise<ApiResponse<{token: string; user: User}>> {
  const response = await fetchApi<{token: string; user: User}>('/auth/register', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
  });

  if (response.status && response.data.token) {
    await setToken(response.data.token);
    await saveUser(response.data.user);
  }

  return response;
}

export async function logout(): Promise<ApiResponse<null>> {
  const response = await fetchApi<null>('/auth/logout', {
    method: 'POST',
    requiresAuth: true,
  });
  await clearToken();
  return response;
}

export async function getProfile(): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/profile', {requiresAuth: true});
}

export async function submitReview(
  data: ReviewRequest,
): Promise<ApiResponse<Review>> {
  return fetchApi<Review>('/reviews', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

export async function submitEnquiry(
  data: EnquiryRequest,
): Promise<ApiResponse<Enquiry>> {
  return fetchApi<Enquiry>('/enquiries', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
  });
}

export async function getFeaturedBusinesses(
  city?: string,
): Promise<ApiResponse<Business[]>> {
  return fetchApi<Business[]>('/businesses', {
    params: {featured: true, city, per_page: 10},
  });
}

export async function getPopularCategories(): Promise<ApiResponse<Category[]>> {
  return fetchApi<Category[]>('/categories', {
    params: {popular: true, per_page: 12},
  });
}

// ---- Marketplace: Services ----

export async function getBusinessServices(
  businessSlug: string,
): Promise<ApiResponse<{business: {id: number; name: string; slug: string}; services: Service[]}>> {
  return fetchApi(`/businesses/${businessSlug}/services`);
}

// ---- Marketplace: Bookings ----

export async function createBooking(
  data: CreateBookingRequest,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>('/bookings', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

export async function getMyBookings(
  page = 1,
  status?: string,
): Promise<ApiResponse<{bookings: Booking[]; pagination: {total: number; page: number; per_page: number; pages: number}}>> {
  return fetchApi(`/bookings`, {
    params: {page, status},
    requiresAuth: true,
  });
}

export async function getBookingDetail(
  id: number,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/bookings/${id}`, {requiresAuth: true});
}

export async function cancelBooking(
  id: number,
  reason: string,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/bookings/${id}/cancel`, {
    method: 'POST',
    body: {reason},
    requiresAuth: true,
  });
}

// ---- Marketplace: Payments ----

export async function createPaymentOrder(
  bookingId: number,
): Promise<ApiResponse<PaymentOrder>> {
  return fetchApi<PaymentOrder>('/payments/create-order', {
    method: 'POST',
    body: {booking_id: bookingId},
    requiresAuth: true,
  });
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ApiResponse<{booking: Booking; payment_id: string}>> {
  return fetchApi('/payments/verify', {
    method: 'POST',
    body: data,
    requiresAuth: true,
  });
}

// ---- Marketplace: Addresses ----

export async function getAddresses(): Promise<ApiResponse<Address[]>> {
  return fetchApi<Address[]>('/addresses', {requiresAuth: true});
}

export async function createAddress(
  data: Omit<Address, 'id' | 'is_default'> & {is_default?: boolean},
): Promise<ApiResponse<Address>> {
  return fetchApi<Address>('/addresses', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

export async function deleteAddress(id: number): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/addresses/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

// ---- Marketplace: Notifications ----

export async function getNotifications(
  page = 1,
): Promise<ApiResponse<{notifications: Notification[]; pagination: {total: number}}>> {
  return fetchApi(`/notifications`, {
    params: {page},
    requiresAuth: true,
  });
}

export async function getUnreadNotificationCount(): Promise<ApiResponse<{unread_count: number}>> {
  return fetchApi('/notifications/unread-count', {requiresAuth: true});
}

export async function markNotificationRead(id: number): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/notifications/${id}/read`, {
    method: 'POST',
    requiresAuth: true,
  });
}

export default {
  fetchApi,
  getCities,
  getCategories,
  getCategory,
  getBusinesses,
  getBusiness,
  searchBusinesses,
  getLocalities,
  getBusinessReviews,
  login,
  register,
  logout,
  getProfile,
  submitReview,
  submitEnquiry,
  getFeaturedBusinesses,
  getPopularCategories,
  getToken,
  setToken,
  clearToken,
  saveUser,
  getSavedUser,
  // Marketplace
  getBusinessServices,
  createBooking,
  getMyBookings,
  getBookingDetail,
  cancelBooking,
  createPaymentOrder,
  verifyPayment,
  getAddresses,
  createAddress,
  deleteAddress,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
};
