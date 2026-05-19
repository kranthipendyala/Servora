// TanStack Query hooks for the web app — mirrors mobile/src/lib/queries.ts.
// Use these instead of calling api.ts directly so loading/error/caching are uniform.
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Business, Booking, User, Pagination } from "@servora/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/Servora/api/index.php/api";

type Envelope<T> = { status: boolean; message: string; data: T };

type ListingResponse<T> = { engine?: string; businesses: T[]; pagination: Pagination };

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("servora:auth_token");
}

async function fetchJson<T>(
  path: string,
  init: RequestInit & { params?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  let url = `${API_BASE}${path}`;
  if (init.params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(init.params)) {
      if (v === undefined || v === null || v === "") continue;
      qs.append(k, String(v));
    }
    const q = qs.toString();
    if (q) url += `?${q}`;
  }

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["X-Auth-Token"] = token;
  }

  const res = await fetch(url, { ...init, headers });
  const json = (await res.json()) as Envelope<T>;
  if (!res.ok || !json.status) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }
  return json.data;
}

// -------------------------------------------------------------------------
// Businesses / listings
// -------------------------------------------------------------------------

export function useFeaturedBusinesses() {
  return useQuery({
    queryKey: ["businesses", "featured"],
    queryFn: () =>
      fetchJson<ListingResponse<Business>>("/businesses", {
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
      fetchJson<ListingResponse<Business>>("/businesses", {
        params: { category: slug, per_page: 30 },
      }),
  });
}

export function useBusiness(slug?: string) {
  return useQuery({
    queryKey: ["business", slug],
    enabled: !!slug,
    queryFn: () => fetchJson<Business>(`/businesses/${slug}`),
  });
}

export function useSearchBusinesses(q: string) {
  return useQuery({
    queryKey: ["search", q],
    enabled: q.length >= 2,
    queryFn: () =>
      fetchJson<ListingResponse<Business>>("/search", { params: { q, per_page: 20 } }),
  });
}

// -------------------------------------------------------------------------
// Bookings
// -------------------------------------------------------------------------

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => fetchJson<{ bookings: Booking[]; pagination: Pagination }>("/bookings"),
  });
}

export function useBooking(id?: number) {
  return useQuery({
    queryKey: ["booking", id],
    enabled: !!id,
    queryFn: () => fetchJson<Booking>(`/bookings/${id}`),
  });
}

// -------------------------------------------------------------------------
// Auth
// -------------------------------------------------------------------------

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => fetchJson<User>("/auth/profile"),
    retry: false,
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (vars: { phone: string }) =>
      fetchJson<{ sent: boolean }>("/auth/phone-login", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
  });
}

export function useVerifyOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { phone: string; otp: string }) =>
      fetchJson<{ token: string; user: User; needs_profile: boolean }>("/otp/verify", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("servora:auth_token", data.token);
      }
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await fetchJson("/auth/logout", { method: "POST" });
      } catch {
        /* server may already consider us logged out */
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("servora:auth_token");
      }
    },
    onSuccess: () => qc.clear(),
  });
}
