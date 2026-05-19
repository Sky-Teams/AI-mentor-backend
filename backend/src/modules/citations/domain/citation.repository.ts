import { Citation, CitationFormatTypes, CitationOutput } from "./citation";

export interface CitationRepository {
  createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    style: CitationFormatTypes;
  }): Promise<void>;
  updateCitation(input: {
    id: string;
    citation: Citation;
    style?: CitationFormatTypes;
  }): Promise<CitationOutput>;
  GetCitationById(
    citationId: string,
    ownerId: string,
  ): Promise<CitationOutput | null>;
}
