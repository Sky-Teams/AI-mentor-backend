import { CitationFormatType } from "@prisma/client";
import { Citation, CitationOutput, CitationType } from "./citation";

export interface CitationRepository {
  createCitaiotn(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
    style: CitationFormatType;
  }): Promise<void>;
  GetCitation(projectId: string, ownerId: string): Promise<CitationOutput[]>;
  GetCitationType(input: CitationOutput): Promise<{
    citation: Citation;
    type: CitationType;
    style: CitationFormatType;
  }>;
  DeleteCitation(citationId: string, ownerId: string): Promise<void>;
  GetCitationById(
    citationId: string,
    ownerId: string,
  ): Promise<CitationOutput | null>;
}
