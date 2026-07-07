import { ApiSuccessResponse } from "../../types/api";
import { apiClient, unwrap } from "./client";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userApi = {
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<
      ApiSuccessResponse<{ message: string }>
    >("/user/change-password", { currentPassword, newPassword });

    return unwrap(response.data);
  },

  async updateProfile(fullName: string): Promise<User> {
    const response = await apiClient.patch<ApiSuccessResponse<User>>(
      "/user/update-profile",
      { fullName },
    );

    return unwrap(response.data);
  },
};
