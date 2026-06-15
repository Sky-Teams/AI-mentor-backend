import { apiClient, unwrap } from "./client";
import type { ApiSuccessResponse } from "../../types/api";

export const journalsApi = {
  async list() {
    const response =
      await apiClient.get<ApiSuccessResponse<any[]>>("/journals");
    return unwrap(response.data);
  },

  async listBySpecialty(specialtyId: string) {
    const response = await apiClient.get<ApiSuccessResponse<any[]>>(
      `/journals?specialtyId=${specialtyId}`,
    );
    return unwrap(response.data);
  },
};
