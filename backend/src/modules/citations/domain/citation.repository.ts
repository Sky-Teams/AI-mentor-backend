import { Citation } from "./citation";

export interface CitationRepository {
  createCitaiotn(input: {
    citation: Citation;
    ownerId: string;
    projectId: string;
  }): Promise<void>;
}
