import { api } from "./axiosInstance";
import type { LoginDto, RegisterDto, LoginResponse, UserResponse } from "../types/auth";

const AUTH = "/api/v1/auth";

// ── Login ─────────────────────────────────────────────
export async function login(dto: LoginDto): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(`${AUTH}/login`, dto);
  localStorage.setItem("access_token", data.data.access_token);
  localStorage.setItem("user", JSON.stringify(data.data.user));
  return data;
}

// ── Register ──────────────────────────────────────────
export async function register(dto: RegisterDto): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>(`${AUTH}/register`, dto);
  return data;
}

// ── Get current profile ───────────────────────────────
export async function getProfile(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`${AUTH}/profile`);
  return data;
}

// ── Logout (client-side) ──────────────────────────────
export function logout(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

// ── Helpers ───────────────────────────────────────────
export function getStoredUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access_token");
}
