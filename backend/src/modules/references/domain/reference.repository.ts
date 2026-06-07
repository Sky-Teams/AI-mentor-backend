import { JournalSearchResponse } from "./reference";

export interface JournalRepository {
  findByDoi(doi: string): Promise<JournalSearchResponse | null>;
  findByTitle(title: string): Promise<JournalSearchResponse[] | []>;
}
