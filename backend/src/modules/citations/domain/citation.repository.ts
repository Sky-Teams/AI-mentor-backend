import { Citation, CitationFormatType, CitationOutput } from "./citation";

export interface CitationRepository {
  createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    style: CitationFormatType;
  }): Promise<void>;
  updateCitation(input: {
    id: string;
    citation: Citation;
    style?: CitationFormatType
  }): Promise<CitationOutput>;
  GetCitationById(
    citationId: string,
    ownerId: string,
  ): Promise<CitationOutput | null>;
}
