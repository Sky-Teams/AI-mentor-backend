import axios from "axios";
import type { ApiSuccessResponse } from "../../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

const ACCESS_TOKEN_STORAGE_KEY = "ai-mentor-access-token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAccessToken = (): string | null =>
  window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

export const setAccessToken = (token: string | null): void => {
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const unwrap = <T>(response: ApiSuccessResponse<T>): T => response.data;
