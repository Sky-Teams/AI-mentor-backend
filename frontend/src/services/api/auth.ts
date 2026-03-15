import { apiClient, setAccessToken, unwrap } from "./client";
import type { ApiSuccessResponse, AuthResult, AuthTokens, User } from "../../types/api";

const REFRESH_TOKEN_STORAGE_KEY = "ai-mentor-refresh-token";
const AUTH_USER_STORAGE_KEY = "ai-mentor-user";

export const getStoredRefreshToken = (): string | null =>
  window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

export const setStoredRefreshToken = (token: string | null): void => {
  if (!token) {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
};

export const getStoredUser = (): User | null => {
  const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

export const setStoredUser = (user: User | null): void => {
  if (!user) {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
};

const persistAuth = (payload: AuthResult): AuthResult => {
  setAccessToken(payload.tokens.accessToken);
  setStoredRefreshToken(payload.tokens.refreshToken);
  setStoredUser(payload.user);
  return payload;
};

export const authApi = {
  async register(input: {
    email: string;
    fullName: string;
    password: string;
  }): Promise<AuthResult> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResult>>(
      "/auth/register",
      input,
    );
    return persistAuth(unwrap(response.data));
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResult>>(
      "/auth/login",
      input,
    );
    return persistAuth(unwrap(response.data));
  },

  async refresh(): Promise<AuthTokens | null> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const response = await apiClient.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/refresh",
      { refreshToken },
    );
    const tokens = unwrap(response.data);
    setAccessToken(tokens.accessToken);
    setStoredRefreshToken(tokens.refreshToken);
    return tokens;
  },

  async me(): Promise<User> {
    const response = await apiClient.get<ApiSuccessResponse<User>>("/auth/me");
    const user = unwrap(response.data);
    setStoredUser(user);
    return user;
  },

  logout(): void {
    setAccessToken(null);
    setStoredRefreshToken(null);
    setStoredUser(null);
  },
};
