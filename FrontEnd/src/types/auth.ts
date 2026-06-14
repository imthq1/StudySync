// ── Auth ──────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserResponse;
}

// ── User ──────────────────────────────────────────────
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  learningGoals?: string;
  reputationPoints: number;
  createdAt: string;
}

// ── Common ────────────────────────────────────────────
export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
