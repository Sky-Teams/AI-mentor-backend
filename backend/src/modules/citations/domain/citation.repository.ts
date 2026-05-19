import { Citation, CitationFormatType, CitationOutput, CitationType } from "./citation";

export interface CitationRepository {
  createCitation(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    style: CitationFormatType;
  }): Promise<void>;
  getCitations(projectId: string, ownerId: string): Promise<CitationOutput[]>;
  getCitationType(input: CitationOutput):{
    citation: Citation;
    type: CitationType;
    style: CitationFormatType;
  };
  deleteCitation(citationId: string, ownerId: string): Promise<void>;
  getCitationById(
    citationId: string,
    ownerId: string,
  ): Promise<CitationOutput | null>;
}
