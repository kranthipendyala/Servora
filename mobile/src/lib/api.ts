import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ApiEnvelope } from "@servora/shared";

const ANDROID_EMULATOR_HOST = "http://10.0.2.2/Servora/api/index.php/api";
const DEFAULT_HOST          = "http://localhost/Servora/api/index.php/api";

export const BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  (Platform.OS === "android" ? ANDROID_EMULATOR_HOST : DEFAULT_HOST);

const TOKEN_KEY = "@servora:auth_token";

export async function getToken() {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export async function setToken(token: string) {
  try { await AsyncStorage.setItem(TOKEN_KEY, token); } catch {}
}
export async function clearToken() {
  try { await AsyncStorage.removeItem(TOKEN_KEY); } catch {}
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean;
};

export async function api<T>(
  path: string,
  { method = "GET", body, params, auth = false }: FetchOptions = {},
): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      qs.append(k, String(v));
    }
    const query = qs.toString();
    if (query) url += `?${query}`;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers["X-Auth-Token"] = token;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json: ApiEnvelope<T> | { status: false; message: string };
  try {
    json = await res.json();
  } catch {
    throw new Error(`Bad JSON from ${path} (HTTP ${res.status})`);
  }

  if (!res.ok || !json.status) {
    throw new Error((json as any)?.message ?? `Request failed: ${res.status}`);
  }
  return (json as ApiEnvelope<T>).data;
}
