// TanStack Query hooks for the vendor app. One file so the data layer is greppable.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, clearToken, setToken } from "./api";
import type { Booking, Service, User, Pagination } from "@servora/shared";

// -------------------------------------------------------------------------
// Vendor identity
// -------------------------------------------------------------------------

export type VendorProfile = User & {
  business_name?: string;
  business_id?: number;
  city_name?: string | null;
  is_verified?: 0 | 1 | boolean;
  is_available?: 0 | 1 | boolean;
};

export function useCurrentVendor() {
  return useQuery({
    queryKey: ["vendor", "me"],
    queryFn: () => api<VendorProfile>("/auth/profile"),
    retry: false,
  });
}

// -------------------------------------------------------------------------
// Dashboard
// -------------------------------------------------------------------------

export type VendorStats = {
  bookings_this_month: number;
  bookings_trend?: string;
  revenue_paise: number;
  revenue_trend?: string;
  avg_rating: number | null;
  rating_trend?: string;
  pending_payout_paise: number;
  next_payout_date?: string;
};

export function useVendorDashboard() {
  return useQuery({
    queryKey: ["vendor", "stats"],
    queryFn: () => api<VendorStats>("/vendor/stats"),
  });
}

export function useUpcomingBookings() {
  return useQuery({
    queryKey: ["vendor", "bookings", "upcoming"],
    queryFn: () => api<{ bookings: Array<Booking & { customer_name?: string; service_name?: string }>; pagination: Pagination }>("/vendor/bookings", {
      params: { upcoming: 1, per_page: 10 },
    }),
  });
}

// -------------------------------------------------------------------------
// Bookings list + detail + lifecycle actions
// -------------------------------------------------------------------------

export function useVendorBookings(status?: string) {
  return useQuery({
    queryKey: ["vendor", "bookings", "list", status ?? "all"],
    queryFn: () => api<{ bookings: Array<Booking & { customer_name?: string; service_name?: string }>; pagination: Pagination }>("/vendor/bookings", {
      params: { status, per_page: 50 },
    }),
  });
}

export function useVendorBooking(id?: number) {
  return useQuery({
    queryKey: ["vendor", "booking", id],
    enabled: !!id,
    queryFn: () => api<Booking & { customer_name: string; customer_phone?: string; service_name?: string; address?: string }>(`/bookings/${id}`),
  });
}

function bookingAction(verb: string) {
  return (id: number) => api<{ ok: true }>(`/vendor/bookings/${id}/${verb}`, { method: "POST" });
}

export function useAcceptBooking()   { const qc = useQueryClient(); return useMutation({ mutationFn: bookingAction("accept"),   onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "booking"] }) }); }
export function useRejectBooking()   { const qc = useQueryClient(); return useMutation({ mutationFn: bookingAction("reject"),   onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "booking"] }) }); }
export function useStartBooking()    { const qc = useQueryClient(); return useMutation({ mutationFn: bookingAction("start"),    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "booking"] }) }); }
export function useCompleteBooking() { const qc = useQueryClient(); return useMutation({ mutationFn: bookingAction("complete"), onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "booking"] }) }); }
export function useCollectPayment()  { const qc = useQueryClient(); return useMutation({ mutationFn: (id: number) => api<{ ok: true }>(`/vendor/bookings/${id}/collect-payment`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "booking"] }) }); }

// -------------------------------------------------------------------------
// Services
// -------------------------------------------------------------------------

export function useMyServices() {
  return useQuery({
    queryKey: ["vendor", "services"],
    queryFn: () => api<{ services: Service[] }>("/vendor/services"),
  });
}

export function useToggleServiceActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; is_active: boolean }) =>
      api<{ ok: true }>(`/vendor/services/${vars.id}`, {
        method: "PUT",
        body: { is_active: vars.is_active ? 1 : 0 },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "services"] }),
  });
}

// -------------------------------------------------------------------------
// Earnings + payouts
// -------------------------------------------------------------------------

export type VendorEarnings = {
  total_revenue_paise: number;
  available_paise: number;
  this_month_paise: number;
  completed_bookings: number;
  next_payout_date?: string;
};

export function useVendorEarnings() {
  return useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: () => api<VendorEarnings>("/vendor/stats"),
  });
}

export type Payout = {
  id: number;
  amount_paise: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
};

export function useRecentPayouts() {
  return useQuery({
    queryKey: ["vendor", "payouts", "recent"],
    queryFn: () => api<{ payouts: Payout[]; pagination: Pagination }>("/vendor/payouts", { params: { per_page: 10 } }),
  });
}

// -------------------------------------------------------------------------
// Profile actions
// -------------------------------------------------------------------------

export function useToggleAvailable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { is_available: boolean }) =>
      api<{ ok: true }>("/vendor/availability", {
        method: "PUT",
        body: { is_available: vars.is_available ? 1 : 0 },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "me"] }),
  });
}

// -------------------------------------------------------------------------
// Chat
// -------------------------------------------------------------------------

export type ChatMessage = {
  id: number;
  from: "customer" | "vendor";
  body: string;
  created_at: string;
};

export function useChatMessages(threadId?: number) {
  return useQuery({
    queryKey: ["vendor", "chat", threadId],
    enabled: !!threadId,
    queryFn: () => api<{ messages: ChatMessage[] }>(`/chat/${threadId}`),
    refetchInterval: 5000,
  });
}

export function useSendChatMessage(threadId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { body: string }) =>
      api<{ message: ChatMessage }>(`/chat/${threadId}`, { method: "POST", body: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor", "chat", threadId] }),
  });
}

// -------------------------------------------------------------------------
// Auth
// -------------------------------------------------------------------------

export function useSendOtp() {
  return useMutation({
    mutationFn: (vars: { phone: string }) =>
      api<{ sent: boolean }>("/auth/phone-login", { method: "POST", body: vars, auth: false }),
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { phone: string; otp: string }) =>
      api<{ token: string; jwt?: string; user: VendorProfile }>("/otp/verify", {
        method: "POST",
        body: vars,
        auth: false,
      }),
    onSuccess: async (data) => {
      // Prefer JWT (forward-looking); fall back to opaque token.
      await setToken(data.jwt ?? data.token);
      qc.invalidateQueries({ queryKey: ["vendor"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try { await api("/auth/logout", { method: "POST" }); } catch {}
      await clearToken();
    },
    onSuccess: () => qc.clear(),
  });
}
