import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi, getStoredUser } from "../../services/api/auth";
import type { AuthResult, User } from "../../types/api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthResult>;
  register: (input: {
    email: string;
    fullName: string;
    password: string;
  }) => Promise<AuthResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (user) {
          const freshUser = await authApi.me();
          setUser(freshUser);
        }
      } catch {
        authApi.logout();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      async login(input) {
        const result = await authApi.login(input);
        setUser(result.user);
        return result;
      },
      async register(input) {
        const result = await authApi.register(input);
        setUser(result.user);
        return result;
      },
      logout() {
        authApi.logout();
        setUser(null);
      },
      async refreshUser() {
        const freshUser = await authApi.me();
        setUser(freshUser);
      },
    }),
    [user, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
