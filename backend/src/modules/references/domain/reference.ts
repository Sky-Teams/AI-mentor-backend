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

export interface Authors {
  firstName: string;
  lastName: string;
}

export interface JournalSearchResponse {
  id: string;
  journalNameAbbrev?: string | null;
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
