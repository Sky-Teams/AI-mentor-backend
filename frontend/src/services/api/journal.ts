import { apiClient, unwrap } from "./client";
import type {
  ApiSuccessResponse,
  CreateJournalInput,
  Journal,
  Specialty,
} from "../../types/api";

export interface JournalSearchResult {
  id: string;
  title: string;
  publisher: string;
  url: string;
  issn: string | null;
}

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

  async findByName(input: { journalName: string }) {
    const response = await apiClient.get<
      ApiSuccessResponse<JournalSearchResult[]>
    >("/admin/journals/findByName", {
      params: input,
    });

    return unwrap(response.data);
  },

  async extractFromSource(input: {
    journalName: string;
    publisher?: string;
    url: string;
    issn?: string | null;
  }) {
    const response = await apiClient.post<ApiSuccessResponse<CreateJournalInput>>(
      "/admin/journals/extract-from-source",
      input,
    );

    return unwrap(response.data);
  },
};
