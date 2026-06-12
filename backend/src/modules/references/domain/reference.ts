export const ReferenceValue = ["JOURNAL"] as const;

export type ReferenceTypes = (typeof ReferenceValue)[number];

export type ReferenceStyle = "APA" | "MLA" | "VANCOUVER";

export interface Authors {
  firstName: string;
  lastName: string;
}

export interface JournalSearchResponse {
  id: string;
  publisher?: string | null;
  doi?: string | null;
  issue?: string | null;
  volume?: string | null;
  page?: string | null;
  title?: string | null;
  authors?: Authors[];
  journalName?: string | null;
  datePublished?: string | null;
}

// Future: add more reference types such as books and websites.
export type Reference = JournalSearchResponse;

export interface CreateReferenceInput {
  reference: Reference;
  type: ReferenceTypes;
}
