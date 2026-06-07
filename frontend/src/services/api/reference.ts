import { ApiSuccessResponse } from "../../types/api";
import { apiClient, unwrap } from "./client";

export type ReferenceTypes = "JOURNAL" | "BOOK";

export type ReferenceStyle = "APA" | "MLA" | "VANCOUVER";

export interface Authors {
  firstName: string;
  lastName: string;
}

export interface JournalSearchResponse {
  id: string;
  publisher?: string | null;
  doi: string;
  issue?: string | null;
  volume?: string | null;
  page?: string | null;
  title?: string | null;
  authors?: Authors[];
  journalName?: string | null;
  datePublished?: string | null;
}

export type Reference = JournalSearchResponse;

export const referenceApi = {
  async getReferences(
    input: { doi?: string; title?: string },
    type: ReferenceTypes,
  ) {
    const response = await apiClient.get<ApiSuccessResponse<Reference[] | []>>(
      `/references/search`,
      {
        params: { doi: input.doi, title: input.title, type: type },
      },
    );

    return unwrap(response.data);
  },
};
