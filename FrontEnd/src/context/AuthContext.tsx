import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { UserResponse, LoginDto, RegisterDto } from "../types/auth";
import * as authService from "../services/authService";

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(
    authService.getStoredUser
  );
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await authService.login(dto);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto) => {
    setIsLoading(true);
    try {
      await authService.register(dto);
      // Tự động login sau khi đăng ký thành công
      const res = await authService.login({ email: dto.email, password: dto.password });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
