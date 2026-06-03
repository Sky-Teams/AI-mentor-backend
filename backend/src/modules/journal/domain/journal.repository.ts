import { JournalDefinition } from "src/shared/seed-data/journals.js";

export interface JournalRepository {
  findAll(): Promise<Array<{ id: string; name: string }>>;
  findById(id: string): Promise<{ id: string; name: string } | null>;
  createJournal(journal: JournalDefinition): Promise<JournalDefinition>;
}
