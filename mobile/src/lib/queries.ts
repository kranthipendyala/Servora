// TanStack Query hooks — keep one file so all data access is greppable.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, clearToken, setToken } from "./api";
import type { Business, Booking, User, Pagination } from "@servora/shared";

type ListingResponse<T> = { engine?: string; businesses: T[]; pagination: Pagination };

// -------------------------------------------------------------------------
// Businesses / listings
// -------------------------------------------------------------------------

export function useFeaturedBusinesses() {
  return useQuery({
    queryKey: ["businesses", "featured"],
    queryFn: () =>
      api<ListingResponse<Business>>("/businesses", {
        params: { verified: 1, sort: "rating", per_page: 8 },
      }),
    staleTime: 5 * 60_000,
  });
}

export function useBusinessesByCategory(slug?: string) {
  return useQuery({
    queryKey: ["businesses", "category", slug],
    enabled: !!slug,
    queryFn: () =>
      api<ListingResponse<Business>>("/businesses", {
        params: { category: slug, per_page: 30 },
      }),
  });
}

export function useBusiness(slug?: string) {
  return useQuery({
    queryKey: ["business", slug],
    enabled: !!slug,
    queryFn: () => api<Business>(`/businesses/${slug}`),
  });
}

export function useSearchBusinesses(q: string) {
  return useQuery({
    queryKey: ["search", q],
    enabled: q.length >= 2,
    queryFn: () =>
      api<ListingResponse<Business>>("/search", { params: { q, per_page: 20 } }),
  });
}

// -------------------------------------------------------------------------
// Bookings
// -------------------------------------------------------------------------

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => api<{ bookings: Booking[]; pagination: Pagination }>("/bookings", { auth: true }),
  });
}

export function useBooking(id?: number) {
  return useQuery({
    queryKey: ["booking", id],
    enabled: !!id,
    queryFn: () => api<Booking>(`/bookings/${id}`, { auth: true }),
  });
}

// -------------------------------------------------------------------------
// Auth
// -------------------------------------------------------------------------

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api<User>("/auth/profile", { auth: true }),
    retry: false,
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (vars: { phone: string }) =>
      api<{ sent: boolean }>("/auth/phone-login", { method: "POST", body: vars }),
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { phone: string; otp: string }) =>
      api<{ token: string; user: User; needs_profile: boolean }>("/otp/verify", {
        method: "POST",
        body: vars,
      }),
    onSuccess: async (data) => {
      await setToken(data.token);
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try { await api("/auth/logout", { method: "POST", auth: true }); } catch {}
      await clearToken();
    },
    onSuccess: () => {
      qc.clear();
    },
  });
}
