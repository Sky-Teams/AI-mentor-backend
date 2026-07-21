import { ApiSuccessResponse } from "../../types/api";
import { apiClient, unwrap } from "./client";

export const ReferenceValue = ["JOURNAL"] as const;

export type ReferenceTypes = (typeof ReferenceValue)[number];

export const ReferenceStyles = [
  "APA",
  "MLA",
  "VANCOUVER",
  "HARVARD",
  "IEEE",
  "CHICAGO_AUTHOR_DATE",
  "CHICAGO_FULL_NOTE",
  "OSCOLA",
] as const;
export type ReferenceStyle = (typeof ReferenceStyles)[number];

export const referenceStyles = [
  { title: "Harvard", value: "HARVARD" },
  { title: "IEEE", value: "IEEE" },
  {
    title: "Chicago Manual of Style 18th edition (author-date)",
    value: "CHICAGO_AUTHOR_DATE",
  },
  {
    title: "Chicago Manual of Style 18th edition (full note)",
    value: "CHICAGO_FULL_NOTE",
  },
  {
    title:
      "OSCOLA(Oxford University Standard for Citation of Legal Authorities)",
    value: "OSCOLA",
  },
];

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
  journalNameAbbrev?: string | null;
  datePublished?: string | null;
}

export type Reference = JournalSearchResponse;

export interface CreateReferenceInput {
  reference: Reference;
  type: ReferenceTypes;
}

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

  async formatReference(data: {
    references: CreateReferenceInput[];
    style: ReferenceStyle;
  }) {
    const response = await apiClient.post<ApiSuccessResponse<string[]>>(
      "/references/format-style",
      data,
    );

    return unwrap(response.data);
  },
};
