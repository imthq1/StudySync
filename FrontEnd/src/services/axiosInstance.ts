import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../types/auth";

// ── Instance ──────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — đính JWT vào mỗi request ───
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — xử lý lỗi tập trung ───────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Token hết hạn → clear và redirect về login
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Helper: lấy message lỗi từ NestJS response ───────
export function getErrorMessage(error: unknown): string {
  const err = error as AxiosError<ApiError>;
  const msg = err.response?.data?.message;
  if (!msg) return "Có lỗi xảy ra. Vui lòng thử lại.";
  return Array.isArray(msg) ? msg[0] : msg;
}
