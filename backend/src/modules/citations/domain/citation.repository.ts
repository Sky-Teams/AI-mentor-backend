import {
  Citation,
  CitationFormatTypes,
  CitationOutput,
  CitationType,
} from "./citation";

export interface CitationRepository {
  createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    style: CitationFormatTypes;
  }): Promise<void>;
  getCitations(projectId: string, ownerId: string): Promise<CitationOutput[]>;
  getCitationType(input: CitationOutput): {
    citation: Citation;
    type: CitationType;
    style: CitationFormatTypes;
  };
  deleteCitation(citationId: string, ownerId: string): Promise<void>;
  getCitationById(
    citationId: string,
    ownerId: string,
  ): Promise<CitationOutput | null>;
}
