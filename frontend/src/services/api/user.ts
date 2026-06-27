import { ApiSuccessResponse } from "../../types/api";
import { apiClient, unwrap } from "./client";

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
};
