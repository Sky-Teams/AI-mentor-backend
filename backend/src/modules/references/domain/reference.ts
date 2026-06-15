export const ReferenceValue = ["JOURNAL"] as const;

export type ReferenceTypes = (typeof ReferenceValue)[number];

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
