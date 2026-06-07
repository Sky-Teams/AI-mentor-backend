import { JournalSearchResponse, Reference, ReferenceTypes } from "./reference";

export interface JournalRepository {
  findByDoi(doi: string): Promise<JournalSearchResponse | null>;
  findByTitle(title: string): Promise<JournalSearchResponse[] | null>;
}

export interface ReferenceFormatter {
  format(reference: Reference, type: ReferenceTypes): Promise<string>;
}
