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
  "AMA",
  "AMERICAN_CHEMICAL_SOCIETY",
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
  {
    title: "APA 7 (American Psychological Association 7th edition)",
    value: "APA",
  },
  { title: "MLA 9 (Modern Language Association 9th edition)", value: "MLA" },
  { title: "AMA (American Medical Association)", value: "AMA" },
  { title: "American Chemical Society", value: "AMERICAN_CHEMICAL_SOCIETY" },
  { title: "Vancouver", value: "VANCOUVER" },
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

export interface LocalReferences {
  id: string;
  text: string;
  raw: Reference;
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

  async formatInlineCitation(data: {
    references: { reference: Reference; referenceIndex: number }[];
    style: ReferenceStyle;
  }) {
    const response = await apiClient.post<
      ApiSuccessResponse<{referenceId: string, formattedText?: string; footnote?: string }[]>
    >("/citations/format-style", data);
    return unwrap(response.data);
  },
};

export const superscriptMap: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};
export const toSuperscript = (value: number) => {
  return value
    .toString()
    .split("")
    .map((digit) => superscriptMap[digit] ?? digit)
    .join("");
};

/** Functions for save references to local storage */
export const STORAGE_KEY = "references";

export const getReferences = (): LocalReferences[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  return JSON.parse(data);
};

export const saveReference = (reference: LocalReferences[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reference));
};

export const addReference = (reference: LocalReferences) => {
  const references = getReferences();

  const exist = references.some((item) => item.raw.doi === reference.raw.doi);
  if (exist) return exist;

  references.push(reference);

  saveReference(references);
  return reference;
};
