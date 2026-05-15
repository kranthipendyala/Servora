import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import type {
  ApiResponse,
  Booking,
  Pagination,
  Service,
  VendorStats,
  SubscriptionPlan,
  Subscription,
  Payout,
  BankDetails,
  VendorDocument,
  Review,
  Notification,
  Availability,
  User,
  CreateServiceRequest,
} from '../types';

const ANDROID_EMULATOR_HOST = 'http://10.0.2.2/Servora/api/api';
const IOS_SIMULATOR_HOST = 'http://localhost/Servora/api/api';

export const BASE_URL = Platform.select({
  android: ANDROID_EMULATOR_HOST,
  ios: IOS_SIMULATOR_HOST,
  default: IOS_SIMULATOR_HOST,
});

const TOKEN_KEY = '@vendor_token';
const USER_KEY = '@vendor_user';

// ---- Token Management ----

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

// ---- Fetch Wrapper ----

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

// ---- Auth ----

export async function vendorLogin(
  email: string,
  password: string,
): Promise<ApiResponse<{token: string; user: User}>> {
  const response = await fetchApi<{token: string; user: User}>('/auth/login', {
    method: 'POST',
    body: {email, password, role: 'vendor'},
  });

  if (response.status && response.data.token) {
    await setToken(response.data.token);
    await saveUser(response.data.user);
  }

  return response;
}

export async function vendorLogout(): Promise<ApiResponse<null>> {
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

// ---- Dashboard ----

export async function getVendorStats(): Promise<ApiResponse<VendorStats>> {
  return fetchApi<VendorStats>('/vendor/stats', {requiresAuth: true});
}

// ---- Bookings ----

export async function getVendorBookings(
  page = 1,
  status?: string,
): Promise<ApiResponse<{bookings: Booking[]; pagination: Pagination}>> {
  return fetchApi('/vendor/bookings', {
    params: {page, status},
    requiresAuth: true,
  });
}

export async function getBookingDetail(
  id: number,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/vendor/bookings/${id}`, {requiresAuth: true});
}

export async function acceptBooking(
  id: number,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/vendor/bookings/${id}/accept`, {
    method: 'POST',
    requiresAuth: true,
  });
}

export async function rejectBooking(
  id: number,
  reason?: string,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/vendor/bookings/${id}/reject`, {
    method: 'POST',
    body: {reason},
    requiresAuth: true,
  });
}

export async function startBooking(
  id: number,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/vendor/bookings/${id}/start`, {
    method: 'POST',
    requiresAuth: true,
  });
}

export async function completeBooking(
  id: number,
  notes?: string,
): Promise<ApiResponse<Booking>> {
  return fetchApi<Booking>(`/vendor/bookings/${id}/complete`, {
    method: 'POST',
    body: {notes},
    requiresAuth: true,
  });
}

// ---- Services ----

export async function getVendorServices(): Promise<ApiResponse<Service[]>> {
  return fetchApi<Service[]>('/vendor/services', {requiresAuth: true});
}

export async function createService(
  data: CreateServiceRequest,
): Promise<ApiResponse<Service>> {
  return fetchApi<Service>('/vendor/services', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

export async function updateService(
  id: number,
  data: Partial<CreateServiceRequest>,
): Promise<ApiResponse<Service>> {
  return fetchApi<Service>(`/vendor/services/${id}`, {
    method: 'PUT',
    body: data as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

export async function deleteService(
  id: number,
): Promise<ApiResponse<null>> {
  return fetchApi<null>(`/vendor/services/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

// ---- Availability ----

export async function getVendorAvailability(): Promise<ApiResponse<Availability[]>> {
  return fetchApi<Availability[]>('/vendor/availability', {requiresAuth: true});
}

export async function updateAvailability(
  data: Availability[],
): Promise<ApiResponse<Availability[]>> {
  return fetchApi<Availability[]>('/vendor/availability', {
    method: 'PUT',
    body: {availability: data} as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

// ---- Subscription ----

export async function getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
  return fetchApi<SubscriptionPlan[]>('/vendor/subscription/plans', {requiresAuth: true});
}

export async function getCurrentSubscription(): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>('/vendor/subscription', {requiresAuth: true});
}

export async function subscribe(
  planId: number,
  cycle: 'monthly' | 'yearly',
): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>('/vendor/subscription', {
    method: 'POST',
    body: {plan_id: planId, billing_cycle: cycle},
    requiresAuth: true,
  });
}

// ---- Payouts ----

export async function getPayouts(
  page = 1,
): Promise<ApiResponse<{payouts: Payout[]; pagination: Pagination}>> {
  return fetchApi('/vendor/payouts', {
    params: {page},
    requiresAuth: true,
  });
}

export async function getBankDetails(): Promise<ApiResponse<BankDetails>> {
  return fetchApi<BankDetails>('/vendor/bank-details', {requiresAuth: true});
}

export async function saveBankDetails(
  data: Omit<BankDetails, 'id' | 'is_verified'>,
): Promise<ApiResponse<BankDetails>> {
  return fetchApi<BankDetails>('/vendor/bank-details', {
    method: 'POST',
    body: data as unknown as Record<string, unknown>,
    requiresAuth: true,
  });
}

// ---- Documents ----

export async function uploadDocument(
  type: string,
  url: string,
): Promise<ApiResponse<VendorDocument>> {
  return fetchApi<VendorDocument>('/vendor/documents', {
    method: 'POST',
    body: {type, url},
    requiresAuth: true,
  });
}

export async function getMyDocuments(): Promise<ApiResponse<VendorDocument[]>> {
  return fetchApi<VendorDocument[]>('/vendor/documents', {requiresAuth: true});
}

// ---- Reviews ----

export async function getVendorReviews(
  page = 1,
): Promise<ApiResponse<{reviews: Review[]; pagination: Pagination}>> {
  return fetchApi('/vendor/reviews', {
    params: {page},
    requiresAuth: true,
  });
}

export async function replyToReview(
  id: number,
  reply: string,
): Promise<ApiResponse<Review>> {
  return fetchApi<Review>(`/vendor/reviews/${id}/reply`, {
    method: 'POST',
    body: {reply},
    requiresAuth: true,
  });
}

// ---- Notifications ----

export async function getNotifications(
  page = 1,
): Promise<ApiResponse<{notifications: Notification[]; pagination: Pagination}>> {
  return fetchApi('/notifications', {
    params: {page},
    requiresAuth: true,
  });
}

export async function getUnreadCount(): Promise<ApiResponse<{unread_count: number}>> {
  return fetchApi('/notifications/unread-count', {requiresAuth: true});
}

export default {
  fetchApi,
  getToken,
  setToken,
  clearToken,
  saveUser,
  getSavedUser,
  // Auth
  vendorLogin,
  vendorLogout,
  getProfile,
  // Dashboard
  getVendorStats,
  // Bookings
  getVendorBookings,
  getBookingDetail,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  // Services
  getVendorServices,
  createService,
  updateService,
  deleteService,
  // Availability
  getVendorAvailability,
  updateAvailability,
  // Subscription
  getSubscriptionPlans,
  getCurrentSubscription,
  subscribe,
  // Payouts
  getPayouts,
  getBankDetails,
  saveBankDetails,
  // Documents
  uploadDocument,
  getMyDocuments,
  // Reviews
  getVendorReviews,
  replyToReview,
  // Notifications
  getNotifications,
  getUnreadCount,
};
