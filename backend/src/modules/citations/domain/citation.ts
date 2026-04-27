export type CitationFormatter =
  | "APA"
  | "MLA"
  | "Chicago"
  | "IEEE"
  | "Vancouver"
  | "Harvard";

export type CitationType = "BOOK" | "WEBSITE" | "JOURNAL" | "REPORT";
export interface Authors {
  firstName: string;
  lastName: string;
}

export interface BaseCitation {
  title: string;
  authors: Array<{
    firstName: string;
    lastName: string;
  }>;
  datePublished: Date;
}

export type Bookcitation = BaseCitation & {
  type: "BOOK";
  publisher: string;
  placePublished?: string;
  isbn?: string;
  page: string;
  volumeNumber?: number;
  edition?: string;
};

export type WebsiteCitation = BaseCitation & {
  type: "WEBSITE";
  websiteName: string;
  url: string;
  dateAccess: Date;
};

export type JournalCitation = BaseCitation & {
  type: "JOURNAL";
  journalName: string;
  page: string;
  volumeNumber?: number;
  issueNumber?: number;
  doi?: string;
};

export type ReportCitation = BaseCitation & {
  type: "REPORT";
  publisher?: string;
  url?: string;
};

export type Citation =
  | Bookcitation
  | WebsiteCitation
  | JournalCitation
  | ReportCitation;

export interface FormatCitationInput {
  citation: Citation;
  style: CitationFormatter;
}

export interface CitaionFormatter {
  format(citation: Citation): Promise<string>;
}

// Interface for OutPut Citation
export interface BaseCitationOutPut {
  id: string;
  citationId: string;
  title: string;
  type: CitationType;
  authors: Authors[];
}

interface BookCitationOutPut extends BaseCitationOutPut {
  publisher: string;
  placePublished?: string | null;
  isbn?: string | null;
  createdAt: Date;
}

interface WebsiteCitationOutPut extends BaseCitationOutPut {
  websiteName: string;
  url: string;
  dateAccess: Date;
  createdAt: Date;
}

interface JournalCitationOutPut extends BaseCitationOutPut {
  journalName: string;
  page: string;
  volumeNumber?: number | null;
  issueNumber?: number | null;
  doi?: string | null;
  createdAt: Date;
}

interface ReportCitationOutPut extends BaseCitationOutPut {
  publisher?: string | null;
  url?: string | null;
  createdAt: Date;
}

export type CitationCompilation =
  | BookCitationOutPut
  | WebsiteCitationOutPut
  | JournalCitationOutPut
  | ReportCitationOutPut;
