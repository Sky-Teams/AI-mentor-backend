import { apiClient, unwrap } from "./client";
import type { ApiSuccessResponse, Journal, Specialty } from "../../types/api";

export const journalsApi = {
  async list() {
    const response =
      await apiClient.get<ApiSuccessResponse<Journal[]>>("/journals");
    return unwrap(response.data);
  },

  async listBySpecialty(specialtyId: string) {
    const response = await apiClient.get<ApiSuccessResponse<Journal[]>>(
      `/journals?specialtyId=${specialtyId}`,
    );
    return unwrap(response.data);
  },

  async getSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<ApiSuccessResponse<Specialty[]>>(
      "/journals/specialties",
    );
    return unwrap(response.data);
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiSuccessResponse<Journal>>(
      `/journals/${id}`,
    );
    return unwrap(response.data);
  },
};
